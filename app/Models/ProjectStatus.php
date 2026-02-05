<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectStatus extends Model
{
    protected $fillable = [
        'key',
        'label',
        'sort_order',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
        ];
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * All status keys (for validation). Uses visible statuses only by default.
     */
    public static function keys(bool $visibleOnly = false): array
    {
        $query = static::query()->ordered();
        if ($visibleOnly) {
            $query->visible();
        }

        return $query->pluck('key')->all();
    }

    /**
     * Key => label map for forms/UI. Uses visible statuses only by default.
     */
    public static function keyLabelMap(bool $visibleOnly = true): array
    {
        $query = static::query()->ordered();
        if ($visibleOnly) {
            $query->visible();
        }

        return $query->pluck('label', 'key')->all();
    }
}
