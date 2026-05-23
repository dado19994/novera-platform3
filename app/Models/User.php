<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuid, Notifiable, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'username',
        'email',
        'password',
        'status',
        'onboarding_status',
        'onboarding_completed',
        'home_country_id',
        'home_city_id',
        'home_area_id',
        'locale',
        'timezone',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'onboarding_completed' => 'boolean',
        ];
    }

    public function homeCountry(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'home_country_id');
    }

    public function homeCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'home_city_id');
    }

    public function homeArea(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'home_area_id');
    }

    public function profiles(): MorphMany
    {
        return $this->morphMany(Profile::class, 'profileable');
    }

    public function creativeIdentities(): BelongsToMany
    {
        return $this->belongsToMany(CreativeIdentity::class, 'user_creative_identity')
            ->withPivot(['profile_id', 'is_primary', 'proficiency', 'availability_status', 'context'])
            ->withTimestamps();
    }

    public function mediaItems(): HasMany
    {
        return $this->hasMany(MediaItem::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function tracks(): HasMany
    {
        return $this->hasMany(Track::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    public function ownedCollectives(): HasMany
    {
        return $this->hasMany(Collective::class, 'owner_user_id');
    }

    public function collectives(): BelongsToMany
    {
        return $this->belongsToMany(Collective::class, 'collective_members')
            ->withPivot(['role', 'status', 'permissions', 'invited_by_user_id', 'joined_at'])
            ->withTimestamps();
    }

    public function organizedEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'organizer_user_id');
    }

    public function collaborations(): HasMany
    {
        return $this->hasMany(Collaboration::class);
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot(['role', 'status', 'last_read_message_id', 'last_read_at', 'muted_until', 'deleted_at'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    public function savedItems(): HasMany
    {
        return $this->hasMany(SavedItem::class);
    }

    public function recommendationSignals(): HasMany
    {
        return $this->hasMany(RecommendationSignal::class);
    }

    protected function username(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => $value ? str($value)->lower()->slug('_')->toString() : null,
        );
    }
}
