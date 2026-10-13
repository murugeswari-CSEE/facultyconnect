package com.facultyconnect.app

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.facultyconnect.app.network.RetrofitClient
import kotlinx.coroutines.launch

class StudentViewActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var searchInput: EditText
    private lateinit var departmentSpinner: Spinner
    private lateinit var loadingSpinner: ProgressBar
    private lateinit var adapter: ProfessorAdapter

    private var allProfessors: List<ProfessorWithStatus> = emptyList()
    private var currentSearch: String = ""
    private var currentDepartment: String = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_student_view)

        recyclerView = findViewById(R.id.professorRecyclerView)
        searchInput = findViewById(R.id.searchInput)
        departmentSpinner = findViewById(R.id.departmentSpinner)
        loadingSpinner = findViewById(R.id.loadingSpinner)

        adapter = ProfessorAdapter(emptyList())
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        searchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                currentSearch = s.toString()
                applyFilters()
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        loadProfessorsAndStatuses()
    }

    private fun loadProfessorsAndStatuses() {
        loadingSpinner.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getAllProfessors()
                if (response.isSuccessful && response.body() != null) {
                    val professors = response.body()!!
                    val withStatus = professors.map { ProfessorWithStatus(it) }.toMutableList()

                    allProfessors = withStatus
                    setupDepartmentSpinner(professors.map { it.department }.distinct())
                    applyFilters()

                    // Fetch each professor's live status one by one
                    for (i in withStatus.indices) {
                        try {
                            val statusResponse = RetrofitClient.apiService.getStatus(withStatus[i].professor._id)
                            if (statusResponse.isSuccessful) {
                                withStatus[i] = withStatus[i].copy(status = statusResponse.body())
                                allProfessors = withStatus.toList()
                                applyFilters()
                            }
                        } catch (e: Exception) {
                            // Skip this professor's status on error, continue with others
                        }
                    }
                } else {
                    Toast.makeText(this@StudentViewActivity, "Failed to load professors", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@StudentViewActivity,
                    "Network error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            } finally {
                loadingSpinner.visibility = View.GONE
            }
        }
    }

    private fun setupDepartmentSpinner(departments: List<String>) {
        val options = mutableListOf("All")
        options.addAll(departments)

        val spinnerAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, options)
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        departmentSpinner.adapter = spinnerAdapter

        departmentSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: View?, position: Int, id: Long) {
                currentDepartment = options[position]
                applyFilters()
            }
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
        }
    }

    private fun applyFilters() {
        val filtered = allProfessors.filter {
            val matchesSearch = it.professor.name.contains(currentSearch, ignoreCase = true)
            val matchesDept = currentDepartment == "All" || it.professor.department == currentDepartment
            matchesSearch && matchesDept
        }
        adapter.updateList(filtered)
    }
}