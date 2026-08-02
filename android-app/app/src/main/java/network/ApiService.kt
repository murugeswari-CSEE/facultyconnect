package com.facultyconnect.app.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val _id: String? = null,
    val name: String? = null,
    val department: String? = null,
    val error: String? = null
)

data class StatusUpdateRequest(
    val manualStatus: String
)

data class ProfessorResponse(
    val _id: String,
    val name: String,
    val email: String,
    val department: String,
    val manualStatus: String,
    val isAutomatic: Boolean
)

interface ApiService {

    @POST("api/professors/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @PATCH("api/professors/{id}/status")
    suspend fun updateStatus(
        @Path("id") id: String,
        @Body request: StatusUpdateRequest
    ): Response<ProfessorResponse>

    @PATCH("api/professors/{id}/resume-automatic")
    suspend fun resumeAutomatic(@Path("id") id: String): Response<ProfessorResponse>
}