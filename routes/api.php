<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollaborationController;
use App\Http\Controllers\Api\CollectiveController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DiscoveryController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\TrackController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/profiles/{username}/media', [ProfileController::class, 'media']);
Route::get('/profiles/{username}/tracks', [ProfileController::class, 'tracks']);
Route::get('/profiles/{username}/events', [ProfileController::class, 'events']);
Route::get('/profiles/{username}/collaborations', [ProfileController::class, 'collaborations']);
Route::get('/profiles/{username}', [ProfileController::class, 'show']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::get('/events/{event}/attendees', [EventController::class, 'attendees']);

Route::get('/collaborations', [CollaborationController::class, 'index']);
Route::get('/collaborations/{collaboration}', [CollaborationController::class, 'show']);

Route::get('/collectives', [CollectiveController::class, 'index']);
Route::get('/collectives/{collective:slug}', [CollectiveController::class, 'show']);
Route::get('/collectives/{collective:slug}/members', [CollectiveController::class, 'members']);
Route::get('/collectives/{collective:slug}/events', [CollectiveController::class, 'events']);
Route::get('/collectives/{collective:slug}/collaborations', [CollectiveController::class, 'collaborations']);

Route::get('/tracks/{track}', [TrackController::class, 'show']);
Route::get('/stories/feed', [StoryController::class, 'feed']);

Route::get('/discovery/home', [DiscoveryController::class, 'home']);
Route::get('/discovery/city/{city}', [DiscoveryController::class, 'city']);
Route::get('/discovery/artists', [DiscoveryController::class, 'artists']);
Route::get('/discovery/events', [DiscoveryController::class, 'events']);
Route::get('/discovery/collaborations', [DiscoveryController::class, 'collaborations']);
Route::get('/discovery/collectives', [DiscoveryController::class, 'collectives']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile/me', [ProfileController::class, 'me']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::put('/onboarding/profile', [OnboardingController::class, 'profile']);
    Route::put('/onboarding/identities', [OnboardingController::class, 'identities']);
    Route::put('/onboarding/moods', [OnboardingController::class, 'moods']);
    Route::post('/onboarding/first-media', [OnboardingController::class, 'firstMedia']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);

    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::post('/events/{event}/attend', [EventController::class, 'attend']);
    Route::delete('/events/{event}/attend', [EventController::class, 'unattend']);
    Route::post('/events/{event}/media', [EventController::class, 'attachMedia']);

    Route::post('/collaborations', [CollaborationController::class, 'store']);
    Route::put('/collaborations/{collaboration}', [CollaborationController::class, 'update']);
    Route::post('/collaborations/{collaboration}/apply', [CollaborationController::class, 'apply']);
    Route::get('/collaborations/{collaboration}/applications', [CollaborationController::class, 'applications']);
    Route::put('/collaborations/{collaboration}/applications/{application}', [CollaborationController::class, 'updateApplication']);

    Route::post('/collectives', [CollectiveController::class, 'store']);
    Route::put('/collectives/{collective:slug}', [CollectiveController::class, 'update']);
    Route::post('/collectives/{collective:slug}/join-request', [CollectiveController::class, 'joinRequest']);
    Route::post('/collectives/{collective:slug}/members/{user}/approve', [CollectiveController::class, 'approveMember']);

    Route::post('/media', [MediaController::class, 'store']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);
    Route::post('/tracks', [TrackController::class, 'store']);
    Route::post('/stories', [StoryController::class, 'store']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage']);

    Route::post('/reactions', [EngagementController::class, 'storeReaction']);
    Route::delete('/reactions/{reaction}', [EngagementController::class, 'destroyReaction']);
    Route::get('/saved', [EngagementController::class, 'saved']);
    Route::post('/saved', [EngagementController::class, 'storeSaved']);
    Route::delete('/saved/{savedItem}', [EngagementController::class, 'destroySaved']);
});
