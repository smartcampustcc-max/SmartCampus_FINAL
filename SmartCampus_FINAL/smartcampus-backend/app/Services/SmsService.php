<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $to, string $message): bool
    {
        try {
            $phone = $this->formatPhone($to);

            $url = config('services.telcosms.base_url');

            $payload = [
                'message' => [
                    'api_key_app'  => config('services.telcosms.api_key'),
                    'phone_number' => $phone,
                    'message_body' => $message,
                ],
            ];

            Log::info('Enviando SMS V2', [
                'url' => $url,
                'payload' => $payload,
            ]);

            $response = Http::asJson()
                ->timeout(60)
                ->connectTimeout(20)
                ->post($url, $payload);

            Log::info('Resposta SMS V2', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('Erro SMS V2', [
                'erro' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function formatPhone(string $phone): string
    {
        return preg_replace('/\D+/', '', $phone);
    }
}