<?php

namespace Database\Seeders;

use App\Models\ProjectStatus;
use Illuminate\Database\Seeder;

class ProjectStatusSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'scheduled_shoot_date', 'label' => 'Scheduled Shoot Date', 'sort_order' => 1],
            ['key' => 'shooting', 'label' => 'Shooting', 'sort_order' => 2],
            ['key' => 'editing', 'label' => 'Editing', 'sort_order' => 3],
            ['key' => 'ready_to_view', 'label' => 'Ready To View', 'sort_order' => 4],
        ];

        foreach ($defaults as $row) {
            ProjectStatus::updateOrCreate(
                ['key' => $row['key']],
                ['label' => $row['label'], 'sort_order' => $row['sort_order'], 'is_visible' => true]
            );
        }
    }
}
