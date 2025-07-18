package com.talenpal.talenpalapp.http.model

data class LoginModel(
    val userId: String,
    val openid: String,
    val refreshToken: String,
    val accessToken: String,
    val expiresTime: String,
)