package com.facultyconnect.app

import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.facultyconnect.app.network.ProfessorResponse
import com.facultyconnect.app.network.RetrofitClient
import com.facultyconnect.app.network.TimetableSlot
import kotlinx.coroutines.launch

class ManageTimetablesActivity : AppCompatActivity() {

    private lateinit var professorSpinner: Spinner
    private lateinit var daySpinner: Spinner
    private lateinit var inputStartTime: EditText
    private lateinit var inputEndTime: EditText
    private lateinit var inputSubject: EditText
    private lateinit var inputClassroom: EditText
    private lateinit var inputBatch: EditText
    private lateinit var slotsContainer: LinearLayout

    private var professors: List<ProfessorResponse> = emptyList()
    private var selectedProfessorId: String? = null

    private val days = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_timetables)

        professorSpinner = findViewById(R.id.professorSpinner)
        daySpinner = findViewById(R.id.daySpinner)
        inputStartTime = findViewById(R.id.inputStartTime)
        inputEndTime = findViewById(R.id.inputEndTime)
        inputSubject = findViewById(R.id.inputSubject)
        inputClassroom = findViewById(R.id.inputClassroom)
        inputBatch = findViewById(R.id.inputBatch)
        slotsContainer = findViewById(R.id.slotsContainer)

        val dayAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, days)
        dayAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        daySpinner.adapter = dayAdapter

        findViewById<Button>(R.id.btnAddSlot).setOnClickListener { addSlot() }

        loadProfessors()
    }

    private fun loadProfessors() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getAllProfessors()
                if (response.isSuccessful && response.body() != null) {
                    professors = response.body()!!
                    val names = professors.map { "${it.name} - ${it.department}" }
                    val adapter = ArrayAdapter(this@ManageTimetablesActivity, android.R.layout.simple_spinner_item, names)
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                    professorSpinner.adapter = adapter

                    professorSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                        override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                            selectedProfessorId = professors[position]._id
                            loadSlots(selectedProfessorId!!)
                        }
                        override fun onNothingSelected(parent: AdapterView<*>?) {}
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageTimetablesActivity, "Failed to load professors", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loadSlots(professorId: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getTimetableForProfessor(professorId)
                if (response.isSuccessful && response.body() != null) {
                    renderSlots(response.body()!!)
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageTimetablesActivity, "Failed to load timetable", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun renderSlots(slots: List<TimetableSlot>) {
        slotsContainer.removeAllViews()
        for (slot in slots) {
            val text = TextView(this).apply {
                text = "${slot.day} ${slot.startTime}-${slot.endTime}: ${slot.subject} (Room ${slot.classroom}, ${slot.batch})"
                setPadding(0, 8, 0, 8)
            }
            slotsContainer.addView(text)
        }
    }

    private fun addSlot() {
        val professorId = selectedProfessorId
        if (professorId == null) {
            Toast.makeText(this, "Select a professor first", Toast.LENGTH_SHORT).show()
            return
        }

        val day = days[daySpinner.selectedItemPosition]
        val startTime = inputStartTime.text.toString().trim()
        val endTime = inputEndTime.text.toString().trim()
        val subject = inputSubject.text.toString().trim()
        val classroom = inputClassroom.text.toString().trim()
        val batch = inputBatch.text.toString().trim()

        if (startTime.isEmpty() || endTime.isEmpty() || subject.isEmpty() || classroom.isEmpty() || batch.isEmpty()) {
            Toast.makeText(this, "Fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.addTimetableSlot(
                    TimetableSlot(
                        professor = professorId,
                        day = day,
                        startTime = startTime,
                        endTime = endTime,
                        subject = subject,
                        classroom = classroom,
                        batch = batch
                    )
                )
                if (response.isSuccessful) {
                    Toast.makeText(this@ManageTimetablesActivity, "Slot added", Toast.LENGTH_SHORT).show()
                    inputStartTime.text.clear()
                    inputEndTime.text.clear()
                    inputSubject.text.clear()
                    inputClassroom.text.clear()
                    inputBatch.text.clear()
                    loadSlots(professorId)
                } else {
                    Toast.makeText(this@ManageTimetablesActivity, "Failed to add slot", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageTimetablesActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}