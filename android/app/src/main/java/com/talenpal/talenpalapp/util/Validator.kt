package com.talenpal.talenpalapp.util

import android.util.Patterns

object Validator {

    fun isValidEmail(email: String): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    fun isValidPassword(password: String): Boolean {
        return "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,20}$".toRegex().matches(password)
    }
}