<?php

namespace App\Imports;

use App\Models\Curso;
use App\Models\SalaDeAula;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class TurmasImport implements ToCollection, WithHeadingRow
{
    public int $importadas = 0;
    public int $atualizadas = 0;
    public array $erros = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            try {
                $siglaCurso = trim((string)($row['sigla_curso'] ?? ''));
                $turma      = trim((string)($row['turma'] ?? ''));
                $classe     = trim((string)($row['classe'] ?? ''));
                $turno      = trim((string)($row['turno'] ?? ''));
                $anoLetivo  = trim((string)($row['ano_letivo'] ?? ''));

                // validação básica
                if ($siglaCurso === '' || $turma === '' || $anoLetivo === '') {
                    $this->erros[] = "Linha ".($index+2).": campos obrigatórios faltando (sigla_curso, turma, ano_letivo).";
                    continue;
                }

                // achar curso
                $curso = Curso::where('sigla', $siglaCurso)->first();
                if (! $curso) {
                    $this->erros[] = "Linha ".($index+2).": curso com sigla '{$siglaCurso}' não existe.";
                    continue;
                }

                // gerar codigo_turma: IG12A + 2025/2026 => IG12A2526
                $codigoTurma = $this->gerarCodigoTurma($turma, $anoLetivo);

                // upsert (se existir, atualiza; se não existir, cria)
                $sala = SalaDeAula::where('codigo_turma', $codigoTurma)->first();

                if ($sala) {
                    $sala->update([
                        'nome' => $turma,
                        'classe' => $classe ?: $sala->classe,
                        'turno' => $turno ?: $sala->turno,
                        'ano_letivo' => $anoLetivo,
                        'curso_id' => $curso->id,
                    ]);
                    $this->atualizadas++;
                } else {
                    SalaDeAula::create([
                        'nome' => $turma,
                        'classe' => $classe ?: null,
                        'turno' => $turno ?: null,
                        'ano_letivo' => $anoLetivo,
                        'codigo_turma' => $codigoTurma,
                        'curso_id' => $curso->id,
                    ]);
                    $this->importadas++;
                }

            } catch (\Throwable $e) {
                $this->erros[] = "Linha ".($index+2).": erro inesperado - ".$e->getMessage();
            }
        }
    }

    private function gerarCodigoTurma(string $turma, string $anoLetivo): string
    {
        // espera "2025/2026"
        $partes = explode('/', $anoLetivo);
        $a = $partes[0] ?? '';
        $b = $partes[1] ?? '';

        $a2 = substr($a, -2);
        $b2 = substr($b, -2);

        return strtoupper($turma . $a2 . $b2); // IG12A2526
    }
}
