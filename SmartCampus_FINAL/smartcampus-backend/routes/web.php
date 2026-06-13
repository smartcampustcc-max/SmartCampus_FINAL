<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

  Route::get('/test-at-config', function () {
    return response()->json([
        'username' => config('services.africastalking.username'),
        'api_key_prefix' => substr((string) config('services.africastalking.api_key'), 0, 8),
    ]);
});