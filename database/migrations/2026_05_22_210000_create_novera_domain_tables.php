<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->char('iso2', 2)->unique();
            $table->char('iso3', 3)->nullable();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->string('status', 40)->default('active')->index();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->restrictOnDelete();
            $table->string('name', 140);
            $table->string('slug', 160);
            $table->string('timezone', 80)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status', 40)->default('active')->index();
            $table->timestamps();

            $table->unique(['country_id', 'slug']);
            $table->index('slug');
            $table->index('created_at');
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->string('name', 140);
            $table->string('slug', 160);
            $table->string('type', 40)->default('neighborhood')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status', 40)->default('active')->index();
            $table->timestamps();

            $table->unique(['city_id', 'slug']);
            $table->index('slug');
            $table->index('created_at');
            $table->index(['latitude', 'longitude']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('home_country_id')->references('id')->on('countries')->nullOnDelete();
            $table->foreign('home_city_id')->references('id')->on('cities')->nullOnDelete();
            $table->foreign('home_area_id')->references('id')->on('areas')->nullOnDelete();
        });

        Schema::create('creative_identities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140)->unique();
            $table->string('type', 40)->index();
            $table->foreignId('parent_id')->nullable()->constrained('creative_identities')->nullOnDelete();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 40)->default('active')->index();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('media_items', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('mediable');
            $table->string('type', 40)->index();
            $table->string('disk', 80);
            $table->string('path', 1024);
            $table->string('original_filename')->nullable();
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->decimal('duration_seconds', 10, 3)->nullable();
            $table->string('alt_text', 500)->nullable();
            $table->string('thumbnail_path', 1024)->nullable();
            $table->string('waveform_path', 1024)->nullable();
            $table->string('processing_status', 40)->default('pending')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
        });

        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->morphs('profileable');
            $table->string('handle', 120)->unique();
            $table->string('display_name', 160);
            $table->string('type', 40)->index();
            $table->text('bio')->nullable();
            $table->string('tagline', 180)->nullable();
            $table->foreignId('avatar_media_item_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->foreignId('cover_media_item_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->foreignId('country_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('website_url', 2048)->nullable();
            $table->json('external_links')->nullable();
            $table->string('visibility', 40)->default('public')->index();
            $table->string('status', 40)->default('active')->index();
            $table->timestamp('featured_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
        });

        Schema::create('user_creative_identity', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('creative_identity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('profile_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->string('proficiency', 40)->nullable();
            $table->string('availability_status', 40)->nullable()->index();
            $table->string('context')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'creative_identity_id', 'profile_id'], 'uci_unique');
            $table->index('created_at');
        });

        Schema::create('moods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->string('type', 40)->default('mood')->index();
            $table->string('status', 40)->default('active')->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('moodables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mood_id')->constrained()->cascadeOnDelete();
            $table->morphs('moodable');
            $table->unsignedTinyInteger('weight')->nullable();
            $table->string('source', 40)->default('user')->index();
            $table->timestamps();

            $table->unique(['mood_id', 'moodable_type', 'moodable_id'], 'moodables_unique');
            $table->index('created_at');
        });

        Schema::create('collectives', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('owner_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('profile_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('country_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cover_media_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->string('name', 180);
            $table->string('slug', 220)->unique();
            $table->string('type', 60)->default('collective')->index();
            $table->string('status', 40)->default('active')->index();
            $table->string('visibility', 40)->default('public')->index();
            $table->string('recruiting_status', 40)->default('closed')->index();
            $table->text('description')->nullable();
            $table->text('manifesto')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
        });

        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('profile_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('country_id')->constrained()->restrictOnDelete();
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 180);
            $table->string('slug', 220);
            $table->string('type', 60)->default('venue')->index();
            $table->string('status', 40)->default('active')->index();
            $table->string('address_line_1')->nullable();
            $table->string('address_line_2')->nullable();
            $table->string('postal_code', 40)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('website_url', 2048)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['city_id', 'slug']);
            $table->index('slug');
            $table->index('created_at');
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('organizer_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('venue_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('country_id')->constrained()->restrictOnDelete();
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 220);
            $table->string('slug', 260)->nullable()->index();
            $table->text('description')->nullable();
            $table->string('type', 60)->index();
            $table->string('status', 40)->default('draft')->index();
            $table->string('visibility', 40)->default('public')->index();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('timezone', 80);
            $table->foreignId('cover_media_item_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->string('ticket_url', 2048)->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index('starts_at');
            $table->index(['city_id', 'status', 'starts_at']);
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('profile_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 40)->default('media')->index();
            $table->string('status', 40)->default('draft')->index();
            $table->string('visibility', 40)->default('public')->index();
            $table->text('caption')->nullable();
            $table->foreignId('primary_media_item_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index(['city_id', 'status', 'published_at']);
        });

        Schema::create('tracks', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('profile_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('audio_media_item_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->foreignId('artwork_media_item_id')->nullable()->constrained('media_items')->nullOnDelete();
            $table->string('title', 180);
            $table->string('slug', 220)->nullable()->index();
            $table->text('description')->nullable();
            $table->string('type', 40)->default('track')->index();
            $table->string('status', 40)->default('draft')->index();
            $table->string('visibility', 40)->default('public')->index();
            $table->string('source_type', 40)->default('upload')->index();
            $table->string('external_url', 2048)->nullable();
            $table->decimal('duration_seconds', 10, 3)->nullable();
            $table->string('genre', 120)->nullable();
            $table->json('credits')->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index(['city_id', 'status', 'published_at']);
        });

        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('country_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('media_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 40)->default('image')->index();
            $table->string('status', 40)->default('active')->index();
            $table->string('visibility', 40)->default('public')->index();
            $table->string('artistic_moment_type', 80)->nullable()->index();
            $table->string('text', 1000)->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index(['city_id', 'status', 'expires_at']);
        });

        Schema::create('event_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 40)->default('interested')->index();
            $table->string('source', 40)->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
            $table->index('created_at');
        });

        Schema::create('event_lineups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('profile_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name_override', 180)->nullable();
            $table->string('role', 80)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status', 40)->default('invited')->index();
            $table->timestamps();

            $table->index('created_at');
            $table->index(['event_id', 'sort_order']);
        });

        Schema::create('event_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_item_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40)->default('gallery')->index();
            $table->string('status', 40)->default('active')->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['event_id', 'media_item_id', 'type']);
            $table->index('created_at');
            $table->index(['event_id', 'sort_order']);
        });

        Schema::create('collaborations', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('country_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 220);
            $table->text('description');
            $table->string('type', 60)->index();
            $table->string('status', 40)->default('draft')->index();
            $table->string('visibility', 40)->default('public')->index();
            $table->string('remote_type', 40)->default('local')->index();
            $table->json('needed_roles')->nullable();
            $table->timestamp('deadline_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index('country_id');
            $table->index(['city_id', 'status', 'deadline_at']);
        });

        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->string('type', 40)->default('direct')->index();
            $table->string('status', 40)->default('active')->index();
            $table->string('subject', 180)->nullable();
            $table->foreignId('collaboration_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collective_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('related');
            $table->foreignId('last_message_id')->nullable()->index();
            $table->timestamp('last_message_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('collaboration_id');
            $table->index('event_id');
            $table->index('collective_id');
            $table->index('created_at');
        });

        Schema::create('collaboration_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collaboration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 40)->default('submitted')->index();
            $table->text('message')->nullable();
            $table->string('portfolio_url', 2048)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('submitted_at')->useCurrent()->index();
            $table->timestamps();

            $table->unique(['collaboration_id', 'user_id']);
            $table->index('created_at');
        });

        Schema::create('collective_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collective_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 60)->default('member')->index();
            $table->string('status', 40)->default('invited')->index();
            $table->json('permissions')->nullable();
            $table->foreignId('invited_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['collective_id', 'user_id']);
            $table->index('created_at');
        });

        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 40)->default('member')->index();
            $table->string('status', 40)->default('active')->index();
            $table->foreignId('last_read_message_id')->nullable()->index();
            $table->timestamp('last_read_at')->nullable()->index();
            $table->timestamp('muted_until')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['conversation_id', 'user_id']);
            $table->index('created_at');
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('media_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 40)->default('text')->index();
            $table->string('status', 40)->default('sent')->index();
            $table->text('body')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('read_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index(['conversation_id', 'created_at']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->foreign('last_message_id')->references('id')->on('messages')->nullOnDelete();
        });

        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->foreign('last_read_message_id')->references('id')->on('messages')->nullOnDelete();
        });

        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('reactionable');
            $table->string('type', 40)->index();
            $table->string('status', 40)->default('active')->index();
            $table->timestamps();

            $table->unique(['user_id', 'reactionable_type', 'reactionable_id', 'type'], 'reactions_unique');
            $table->index('created_at');
        });

        Schema::create('saved_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('saveable');
            $table->string('type', 40)->default('save')->index();
            $table->string('status', 40)->default('active')->index();
            $table->string('collection_name', 120)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'saveable_type', 'saveable_id', 'type'], 'saved_items_unique');
            $table->index('created_at');
        });

        Schema::create('recommendation_signals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('signalable');
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 60)->index();
            $table->string('source', 60)->index();
            $table->string('status', 40)->default('active')->index();
            $table->decimal('weight', 8, 4)->nullable();
            $table->string('reason_code', 80)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamp('created_at')->useCurrent()->index();

            $table->index(['user_id', 'type', 'occurred_at']);
            $table->index(['city_id', 'type', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendation_signals');
        Schema::dropIfExists('saved_items');
        Schema::dropIfExists('reactions');
        Schema::table('conversation_participants', function (Blueprint $table) {
            $table->dropForeign(['last_read_message_id']);
        });
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['last_message_id']);
        });
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('collective_members');
        Schema::dropIfExists('collaboration_applications');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('collaborations');
        Schema::dropIfExists('event_media');
        Schema::dropIfExists('event_lineups');
        Schema::dropIfExists('event_attendees');
        Schema::dropIfExists('stories');
        Schema::dropIfExists('tracks');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('events');
        Schema::dropIfExists('venues');
        Schema::dropIfExists('collectives');
        Schema::dropIfExists('moodables');
        Schema::dropIfExists('moods');
        Schema::dropIfExists('user_creative_identity');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('media_items');
        Schema::dropIfExists('creative_identities');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['home_country_id']);
            $table->dropForeign(['home_city_id']);
            $table->dropForeign(['home_area_id']);
        });

        Schema::dropIfExists('areas');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('countries');
    }
};
