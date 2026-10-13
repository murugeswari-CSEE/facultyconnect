package com.facultyconnect.app

import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.facultyconnect.app.network.LogEntry
import com.facultyconnect.app.network.RetrofitClient
import kotlinx.coroutines.launch

class ViewLogsActivity : AppCompatActivity() {

    private lateinit var logsContainer: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_view_logs)

        logsContainer = findViewById(R.id.logsContainer)
        loadLogs()
    }

    private fun loadLogs() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getLogs()
                if (response.isSuccessful && response.body() != null) {
                    renderLogs(response.body()!!)
                } else {
                    Toast.makeText(this@ViewLogsActivity, "Failed to load logs", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ViewLogsActivity, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun renderLogs(logs: List<LogEntry>) {
        logsContainer.removeAllViews()
        for (log in logs) {
            val text = TextView(this).apply {
                text = "${log.professor?.name ?: "Unknown"} — ${log.action}: ${log.details}\n${log.createdAt}"
                textSize = 14f
                setPadding(0, 12, 0, 12)
            }
            logsContainer.addView(text)
        }
    }
}