<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    /** Key used for "ready to view" – triggers media link notification when set. */
    public const STATUS_READY_TO_VIEW = 'ready_to_view';

    /**
     * Visible statuses for forms/UI (key => label). Use ProjectStatus::keyLabelMap() for admin/all.
     */
    public static function statuses(): array
    {
        return ProjectStatus::keyLabelMap(visibleOnly: true);
    }

    protected $fillable = [
        'customer_id',
        'name',
        'status',
        'scheduled_shoot_date',
        'media_links',
        'notes',
        'project_types',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_shoot_date' => 'date',
            'completed_at' => 'datetime',
            'media_links' => 'array',
            'project_types' => 'array',
        ];
    }

    public function getMediaLinkAttribute(): ?string
    {
        $links = $this->media_links ?? [];

        return is_array($links) && count($links) > 0 ? $links[0] : null;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('completed_at');
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('completed_at');
    }

    public function isArchived(): bool
    {
        return $this->completed_at !== null;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function getStatusLabelAttribute(): string
    {
        $all = ProjectStatus::keyLabelMap(visibleOnly: false);

        return $all[$this->status] ?? $this->status;
    }
}
