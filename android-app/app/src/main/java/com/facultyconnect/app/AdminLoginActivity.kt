package com.facultyconnect.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.facultyconnect.app.network.AdminLoginRequest
import com.facultyconnect.app.network.RetrofitClient
import kotlinx.coroutines.launch

class AdminLoginActivity : AppCompatActivity() {

    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var loginButton: Button
    private lateinit var progress: ProgressBar
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_login)

        sessionManager = SessionManager(this)

        emailInput = findViewById(R.id.adminEmailInput)
        passwordInput = findViewById(R.id.adminPasswordInput)
        loginButton = findViewById(R.id.adminLoginButton)
        progress = findViewById(R.id.adminLoginProgress)

        loginButton.setOnClickListener {
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Enter email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            performAdminLogin(email, password)
        }
    }

    private fun performAdminLogin(email: String, password: String) {
        setLoading(true)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.adminLogin(AdminLoginRequest(email, password))

                if (response.isSuccessful && response.body()?.token != null) {
                    sessionManager.saveAdminToken(response.body()!!.token!!)
                    Toast.makeText(this@AdminLoginActivity, "Welcome, Admin", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@AdminLoginActivity, AdminDashboardActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this@AdminLoginActivity, "Invalid admin credentials", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminLoginActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        progress.visibility = if (loading) View.VISIBLE else View.GONE
        loginButton.isEnabled = !loading
    }
}