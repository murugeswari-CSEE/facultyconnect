package com.facultyconnect.app

import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.facultyconnect.app.network.AddProfessorRequest
import com.facultyconnect.app.network.EditProfessorRequest
import com.facultyconnect.app.network.ProfessorResponse
import com.facultyconnect.app.network.RetrofitClient
import kotlinx.coroutines.launch

class ManageFacultyActivity : AppCompatActivity() {

    private lateinit var inputName: EditText
    private lateinit var inputEmail: EditText
    private lateinit var inputPassword: EditText
    private lateinit var inputDepartment: EditText
    private lateinit var listContainer: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_manage_faculty)

        inputName = findViewById(R.id.inputName)
        inputEmail = findViewById(R.id.inputEmail)
        inputPassword = findViewById(R.id.inputPassword)
        inputDepartment = findViewById(R.id.inputDepartment)
        listContainer = findViewById(R.id.professorListContainer)

        findViewById<Button>(R.id.btnAddProfessor).setOnClickListener {
            addProfessor()
        }

        loadProfessors()
    }

    private fun addProfessor() {
        val name = inputName.text.toString().trim()
        val email = inputEmail.text.toString().trim()
        val password = inputPassword.text.toString().trim()
        val department = inputDepartment.text.toString().trim()

        if (name.isEmpty() || email.isEmpty() || password.isEmpty() || department.isEmpty()) {
            Toast.makeText(this, "Fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.addProfessor(
                    AddProfessorRequest(name, email, password, department)
                )
                if (response.isSuccessful) {
                    Toast.makeText(this@ManageFacultyActivity, "Professor added", Toast.LENGTH_SHORT).show()
                    inputName.text.clear()
                    inputEmail.text.clear()
                    inputPassword.text.clear()
                    inputDepartment.text.clear()
                    loadProfessors()
                } else {
                    Toast.makeText(this@ManageFacultyActivity, "Failed to add professor", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageFacultyActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun loadProfessors() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getAllProfessors()
                if (response.isSuccessful && response.body() != null) {
                    renderProfessorList(response.body()!!)
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageFacultyActivity, "Failed to load professors", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun renderProfessorList(professors: List<ProfessorResponse>) {
        listContainer.removeAllViews()

        for (prof in professors) {
            val itemLayout = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(0, 16, 0, 16)
            }

            val infoText = TextView(this).apply {
                text = "${prof.name} - ${prof.department} - ${prof.email}"
                textSize = 15f
            }
            itemLayout.addView(infoText)

            val buttonRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.START
            }

            val editButton = Button(this).apply {
                text = "Edit"
                setOnClickListener { showEditDialog(prof) }
            }
            val deleteButton = Button(this).apply {
                text = "Delete"
                setOnClickListener { deleteProfessor(prof._id) }
            }

            buttonRow.addView(editButton)
            buttonRow.addView(deleteButton)
            itemLayout.addView(buttonRow)

            listContainer.addView(itemLayout)
        }
    }

    private fun showEditDialog(prof: ProfessorResponse) {
        val nameField = EditText(this).apply { setText(prof.name) }
        val deptField = EditText(this).apply { setText(prof.department) }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 20, 40, 20)
            addView(nameField)
            addView(deptField)
        }

        android.app.AlertDialog.Builder(this)
            .setTitle("Edit Professor")
            .setView(container)
            .setPositiveButton("Save") { _, _ ->
                val newName = nameField.text.toString().trim()
                val newDept = deptField.text.toString().trim()
                editProfessor(prof._id, newName, newDept)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun editProfessor(id: String, name: String, department: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.editProfessor(
                    id, EditProfessorRequest(name, department)
                )
                if (response.isSuccessful) {
                    Toast.makeText(this@ManageFacultyActivity, "Updated", Toast.LENGTH_SHORT).show()
                    loadProfessors()
                } else {
                    Toast.makeText(this@ManageFacultyActivity, "Failed to update", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageFacultyActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun deleteProfessor(id: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.deleteProfessor(id)
                if (response.isSuccessful) {
                    Toast.makeText(this@ManageFacultyActivity, "Deleted", Toast.LENGTH_SHORT).show()
                    loadProfessors()
                } else {
                    Toast.makeText(this@ManageFacultyActivity, "Failed to delete", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ManageFacultyActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}