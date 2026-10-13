package com.facultyconnect.app

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_dashboard)

        sessionManager = SessionManager(this)

        if (!sessionManager.isAdminLoggedIn()) {
            startActivity(Intent(this, AdminLoginActivity::class.java))
            finish()
            return
        }

        findViewById<Button>(R.id.btnManageFaculty).setOnClickListener {
            startActivity(Intent(this, ManageFacultyActivity::class.java))
        }

        findViewById<Button>(R.id.btnManageTimetables).setOnClickListener {
            startActivity(Intent(this, ManageTimetablesActivity::class.java))
        }

        findViewById<Button>(R.id.btnViewLogs).setOnClickListener {
            startActivity(Intent(this, ViewLogsActivity::class.java))
        }

        findViewById<Button>(R.id.btnAdminLogout).setOnClickListener {
            sessionManager.clearAdminSession()
            startActivity(Intent(this, RoleSelectorActivity::class.java))
            finish()
        }
    }
}