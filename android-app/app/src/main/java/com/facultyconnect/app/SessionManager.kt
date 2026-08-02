package com.facultyconnect.app

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("faculty_connect_prefs", Context.MODE_PRIVATE)

    fun saveSession(professorId: String, name: String, department: String) {
        prefs.edit()
            .putString("professorId", professorId)
            .putString("name", name)
            .putString("department", department)
            .apply()
    }

    fun getProfessorId(): String? = prefs.getString("professorId", null)

    fun getName(): String? = prefs.getString("name", null)

    fun getDepartment(): String? = prefs.getString("department", null)

    fun clearSession() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean = getProfessorId() != null
}