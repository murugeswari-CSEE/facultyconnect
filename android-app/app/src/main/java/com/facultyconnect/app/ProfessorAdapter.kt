package com.facultyconnect.app

import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.facultyconnect.app.network.ProfessorResponse
import com.facultyconnect.app.network.StatusResponse

data class ProfessorWithStatus(
    val professor: ProfessorResponse,
    var status: StatusResponse? = null
)

class ProfessorAdapter(
    private var items: List<ProfessorWithStatus>
) : RecyclerView.Adapter<ProfessorAdapter.ProfessorViewHolder>() {

    class ProfessorViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val statusDot: View = view.findViewById(R.id.statusDot)
        val name: TextView = view.findViewById(R.id.professorName)
        val dept: TextView = view.findViewById(R.id.professorDept)
        val status: TextView = view.findViewById(R.id.professorStatus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProfessorViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_professor, parent, false)
        return ProfessorViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProfessorViewHolder, position: Int) {
        val item = items[position]
        holder.name.text = item.professor.name
        holder.dept.text = item.professor.department

        val statusText = item.status?.status ?: "Loading..."
        val extra = if (item.status?.subject != null) {
            " (${item.status?.subject}, Room ${item.status?.classroom}, Free at ${item.status?.freeAt})"
        } else {
            ""
        }
        holder.status.text = statusText + extra

        val color = when (item.status?.status) {
            "In Cabin" -> Color.parseColor("#2ecc71")
            "In Class" -> Color.parseColor("#f1c40f")
            "In Meeting" -> Color.parseColor("#3498db")
            "Out of Office" -> Color.parseColor("#e74c3c")
            else -> Color.parseColor("#cccccc")
        }

        val drawable = holder.statusDot.background as GradientDrawable
        drawable.setColor(color)
    }

    override fun getItemCount(): Int = items.size

    fun updateList(newItems: List<ProfessorWithStatus>) {
        items = newItems
        notifyDataSetChanged()
    }
}