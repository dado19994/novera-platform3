<?php

namespace App\Providers;

use App\Models\Collaboration;
use App\Models\Collective;
use App\Models\Conversation;
use App\Models\Event;
use App\Models\MediaItem;
use App\Models\Post;
use App\Models\Profile;
use App\Models\Track;
use App\Policies\CollaborationPolicy;
use App\Policies\CollectivePolicy;
use App\Policies\ConversationPolicy;
use App\Policies\EventPolicy;
use App\Policies\MediaItemPolicy;
use App\Policies\PostPolicy;
use App\Policies\ProfilePolicy;
use App\Policies\TrackPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(Collaboration::class, CollaborationPolicy::class);
        Gate::policy(Collective::class, CollectivePolicy::class);
        Gate::policy(Conversation::class, ConversationPolicy::class);
        Gate::policy(Profile::class, ProfilePolicy::class);
        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(Track::class, TrackPolicy::class);
        Gate::policy(MediaItem::class, MediaItemPolicy::class);
    }
}
