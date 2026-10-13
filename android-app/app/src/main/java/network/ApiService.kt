package com.facultyconnect.app.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
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

data class StatusResponse(
    val professor: String,
    val department: String,
    val status: String,
    val subject: String? = null,
    val classroom: String? = null,
    val batch: String? = null,
    val freeAt: String? = null
)

data class AdminLoginRequest(
    val email: String,
    val password: String
)

data class AdminLoginResponse(
    val token: String? = null,
    val error: String? = null
)

data class AddProfessorRequest(
    val name: String,
    val email: String,
    val password: String,
    val department: String
)

data class EditProfessorRequest(
    val name: String,
    val department: String
)

data class TimetableSlot(
    val _id: String? = null,
    val professor: String,
    val day: String,
    val startTime: String,
    val endTime: String,
    val subject: String,
    val classroom: String,
    val batch: String
)

data class LogEntryProfessor(
    val name: String? = null,
    val department: String? = null
)

data class LogEntry(
    val _id: String,
    val professor: LogEntryProfessor?,
    val action: String,
    val details: String,
    val createdAt: String
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

    @GET("api/professors")
    suspend fun getAllProfessors(): Response<List<ProfessorResponse>>

    @GET("api/status/{id}")
    suspend fun getStatus(@Path("id") id: String): Response<StatusResponse>

    // ---- Admin endpoints ----

    @POST("api/admin/login")
    suspend fun adminLogin(@Body request: AdminLoginRequest): Response<AdminLoginResponse>

    @POST("api/professors")
    suspend fun addProfessor(@Body request: AddProfessorRequest): Response<ProfessorResponse>

    @PUT("api/professors/{id}")
    suspend fun editProfessor(
        @Path("id") id: String,
        @Body request: EditProfessorRequest
    ): Response<ProfessorResponse>

    @DELETE("api/professors/{id}")
    suspend fun deleteProfessor(@Path("id") id: String): Response<Unit>

    @GET("api/timetables/{professorId}")
    suspend fun getTimetableForProfessor(@Path("professorId") professorId: String): Response<List<TimetableSlot>>

    @POST("api/timetables")
    suspend fun addTimetableSlot(@Body request: TimetableSlot): Response<TimetableSlot>

    @GET("api/logs")
    suspend fun getLogs(): Response<List<LogEntry>>
}