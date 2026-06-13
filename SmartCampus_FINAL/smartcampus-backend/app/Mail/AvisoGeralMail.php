<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AvisoGeralMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public array $dados) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Aviso SmartCampus — ' . now()->format('d/m/Y'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.aviso-geral',
            with: ['dados' => $this->dados],
        );
    }
}