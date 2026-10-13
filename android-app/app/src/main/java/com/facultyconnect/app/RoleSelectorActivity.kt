package com.facultyconnect.app

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class RoleSelectorActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_role_selector)

        findViewById<Button>(R.id.btnProfessorLogin).setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        findViewById<Button>(R.id.btnStudentView).setOnClickListener {
            startActivity(Intent(this, StudentViewActivity::class.java))
        }

        findViewById<Button>(R.id.btnAdminLogin).setOnClickListener {
            startActivity(Intent(this, AdminLoginActivity::class.java))
        }
    }
}