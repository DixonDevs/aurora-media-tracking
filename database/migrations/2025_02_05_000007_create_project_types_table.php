<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed initial types (IDs 1, 2, 3 for migration of existing project_types column)
        DB::table('project_types')->insert([
            ['id' => 1, 'name' => 'Photography', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Videography', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Drone', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Convert existing projects.project_types from string keys to IDs
        $keyToId = [1 => 'photography', 2 => 'videography', 3 => 'drone'];
        $projects = DB::table('projects')->whereNotNull('project_types')->get();
        foreach ($projects as $p) {
            $decoded = json_decode($p->project_types, true);
            if (! is_array($decoded)) {
                continue;
            }
            $ids = [];
            foreach ($decoded as $key) {
                $key = is_string($key) ? strtolower($key) : $key;
                foreach ($keyToId as $id => $k) {
                    if ($k === $key) {
                        $ids[] = $id;
                        break;
                    }
                }
            }
            DB::table('projects')->where('id', $p->id)->update([
                'project_types' => json_encode(array_values($ids)),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('project_types');
    }
};
