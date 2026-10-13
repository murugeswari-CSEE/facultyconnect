package com.facultyconnect.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
//import com.facultyconnect.app.geofence.GeofenceHelper
import com.facultyconnect.app.network.RetrofitClient
import com.facultyconnect.app.network.StatusUpdateRequest
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager
    private lateinit var welcomeText: TextView
    private lateinit var currentStatusText: TextView
    //private lateinit var geofenceHelper: GeofenceHelper

    private val locationPermissionCode = 100
    private val backgroundLocationPermissionCode = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        sessionManager = SessionManager(this)

        if (!sessionManager.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        welcomeText = findViewById(R.id.welcomeText)
        currentStatusText = findViewById(R.id.currentStatusText)

        welcomeText.text = "Welcome, ${sessionManager.getName()}"
        currentStatusText.text = "Update your status below"

        //geofenceHelper = GeofenceHelper(this)

        findViewById<Button>(R.id.btnInCabin).setOnClickListener { updateStatus("In Cabin") }
        findViewById<Button>(R.id.btnInMeeting).setOnClickListener { updateStatus("In Meeting") }
        findViewById<Button>(R.id.btnOutOfOffice).setOnClickListener { updateStatus("Out of Office") }
        findViewById<Button>(R.id.btnResumeAutomatic).setOnClickListener { resumeAutomatic() }
        findViewById<Button>(R.id.btnLogout).setOnClickListener { logout() }

        requestLocationPermissions()
    }

    private fun updateStatus(status: String) {
        val professorId = sessionManager.getProfessorId() ?: return

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.updateStatus(
                    professorId,
                    StatusUpdateRequest(status)
                )
                if (response.isSuccessful) {
                    currentStatusText.text = "Current status: $status"
                    Toast.makeText(this@MainActivity, "Status updated to $status", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@MainActivity, "Failed to update status", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun resumeAutomatic() {
        val professorId = sessionManager.getProfessorId() ?: return

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.resumeAutomatic(professorId)
                if (response.isSuccessful) {
                    currentStatusText.text = "Automatic status resumed"
                    Toast.makeText(this@MainActivity, "Resumed automatic status", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@MainActivity, "Failed to resume automatic status", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun logout() {
        sessionManager.clearSession()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }


    private fun requestLocationPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
                locationPermissionCode
            )
        } else {
            requestBackgroundLocationIfNeeded()
        }
    }

    private fun requestBackgroundLocationIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.ACCESS_BACKGROUND_LOCATION),
                    backgroundLocationPermissionCode
                )
            } else {
                //geofenceHelper.setupGeofences(sessionManager.getProfessorId() ?: "")
            }
        } else {
            //geofenceHelper.setupGeofences(sessionManager.getProfessorId() ?: "")
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == locationPermissionCode) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                requestBackgroundLocationIfNeeded()
            } else {
                Toast.makeText(this, "Location permission is required for geofencing", Toast.LENGTH_LONG).show()
            }
        } else if (requestCode == backgroundLocationPermissionCode) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                //geofenceHelper.setupGeofences(sessionManager.getProfessorId() ?: "")
            } else {
                Toast.makeText(this, "Background location denied — geofencing won't work in background", Toast.LENGTH_LONG).show()
            }
        }
    }
}