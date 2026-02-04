<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    use HasFactory;

    public const STATUS_SCHEDULED_SHOOT_DATE = 'scheduled_shoot_date';
    public const STATUS_SHOOTING = 'shooting';
    public const STATUS_EDITING = 'editing';
    public const STATUS_READY_TO_VIEW = 'ready_to_view';

    public static function statuses(): array
    {
        return [
            self::STATUS_SCHEDULED_SHOOT_DATE => 'Scheduled Shoot Date',
            self::STATUS_SHOOTING => 'Shooting',
            self::STATUS_EDITING => 'Editing',
            self::STATUS_READY_TO_VIEW => 'Ready To View',
        ];
    }

    protected $fillable = [
        'customer_id',
        'name',
        'status',
        'scheduled_shoot_date',
        'media_link',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_shoot_date' => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return self::statuses()[$this->status] ?? $this->status;
    }
}
