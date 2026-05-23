<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Media\StoreMediaRequest;
use App\Http\Resources\MediaItemResource;
use App\Models\MediaItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function store(StoreMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $disk = $request->validated('disk') ?? config('filesystems.default', 'public');
        $path = $file->store('media/'.$request->validated('type'), $disk);

        $media = MediaItem::query()->create([
            'user_id' => $request->user()->id,
            'type' => $request->validated('type'),
            'disk' => $disk,
            'path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
            'size_bytes' => $file->getSize() ?: 0,
            'duration_seconds' => $request->validated('duration_seconds'),
            'alt_text' => $request->validated('alt_text'),
            'processing_status' => 'ready',
        ]);

        return response()->json([
            'message' => 'Media uploaded.',
            'media' => new MediaItemResource($media),
        ], 201);
    }

    public function destroy(MediaItem $media): JsonResponse
    {
        abort_unless($media->user_id === request()->user()->id, 403);

        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return response()->json([
            'message' => 'Media deleted.',
        ]);
    }
}
