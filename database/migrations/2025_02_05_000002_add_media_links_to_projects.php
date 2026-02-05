<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->json('media_links')->nullable()->after('notes');
        });

        foreach (DB::table('projects')->whereNotNull('media_link')->get() as $row) {
            DB::table('projects')->where('id', $row->id)->update([
                'media_links' => json_encode([$row->media_link]),
            ]);
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('media_link');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('media_link')->nullable()->after('notes');
        });

        foreach (DB::table('projects')->whereNotNull('media_links')->get() as $row) {
            $links = json_decode($row->media_links, true);
            $first = is_array($links) && count($links) > 0 ? $links[0] : null;
            if ($first !== null) {
                DB::table('projects')->where('id', $row->id)->update(['media_link' => $first]);
            }
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('media_links');
        });
    }
};
