# Resource Library Update — 2026-10-04

Today's resource-library work deepens the Digital Bookshelf without copying third-party content.

## Added Watch catalog

A new `resources/watch.json` catalog contains four verified primary-source resources:

- NIMH's **Jane the Brain** video series, including audio-description availability.
- SAMHSA's **Stress Management Techniques, Healthy Coping Strategies, Breathing Exercise** video.
- SAMHSA's **Breathe In: Video 1**.
- SAMHSA's Spanish-language **Respira 3**.

Each record carries publisher, official URL, format, language, duration, accessibility, region, provenance, evidence notes, limitations, review status, and verification date.

## Retrieval architecture

The resource registry now supports deterministic shelf classification across:

- Read
- Listen
- Practice
- Watch
- Sleep & Rest
- Understand Yourself
- Reach Out

It also supports need and available-time filtering without a learned or opaque score.

## Safety and agency

Watch resources are catalog metadata only. SootheSpot does not copy or remix the source media.

Safety/crisis resources remain a distinct pathway rather than being mixed into ordinary coping recommendations.

The next implementation dependency is to connect the new Watch catalog and shelf controls directly to the Resource Explorer UI, then run the full CI suite (unit tests, build, and Playwright) before merging.
