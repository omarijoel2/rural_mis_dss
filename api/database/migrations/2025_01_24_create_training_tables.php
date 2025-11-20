<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('title');
            $table->string('code')->unique();
            $table->string('domain'); // Ops/Lab/HSE/CRM/Finance
            $table->string('level'); // basic/intermediate/advanced
            $table->string('format'); // video/SCORM/live/reading
            $table->integer('credits')->default(0);
            $table->integer('duration_min')->default(0);
            $table->json('prerequisites')->nullable(); // Array of course IDs
            $table->integer('expiry_days')->nullable(); // Certificate expiry
            $table->foreignId('owner_id')->constrained('users')->onDelete('restrict');
            $table->json('syllabus')->nullable();
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('enrollments_count')->default(0);
            $table->string('status')->default('draft'); // draft/published/archived
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index(['domain', 'level']);
        });

        // Lessons
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->string('type'); // video/slide/scorm/reading/quiz/checklist
            $table->text('content_url')->nullable();
            $table->json('content_json')->nullable(); // For interactive content
            $table->integer('order_index')->default(0);
            $table->integer('duration_min')->default(0);
            $table->boolean('is_mandatory')->default(true);
            $table->timestamps();

            $table->index(['course_id', 'order_index']);
        });

        // Enrollments
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('status')->default('enrolled'); // enrolled/in_progress/completed/withdrawn
            $table->integer('progress_percent')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('final_score', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
            $table->index(['tenant_id', 'status']);
            $table->index('due_at');
        });

        // Lesson Progress
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->boolean('is_completed')->default(false);
            $table->integer('time_spent_seconds')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['enrollment_id', 'lesson_id']);
        });

        // Assessments
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->string('type'); // quiz/practical/assignment
            $table->integer('passing_score')->default(70);
            $table->integer('max_attempts')->default(3);
            $table->integer('time_limit_min')->nullable();
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('show_answers')->default(false);
            $table->timestamps();
        });

        // Questions
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->string('type'); // multiple_choice/true_false/essay/practical
            $table->text('question_text');
            $table->json('options')->nullable(); // For multiple choice
            $table->json('correct_answer');
            $table->text('explanation')->nullable();
            $table->integer('points')->default(1);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // Assessment Attempts
        Schema::create('assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->onDelete('cascade');
            $table->foreignId('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->integer('attempt_number')->default(1);
            $table->json('answers')->nullable();
            $table->decimal('score', 5, 2)->default(0);
            $table->boolean('passed')->default(false);
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->json('evidence')->nullable(); // Photos, signatures, etc.
            $table->foreignId('assessor_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['enrollment_id', 'attempt_number']);
        });

        // Certificates
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('code')->unique(); // Certificate number
            $table->string('qr_token')->unique(); // For verification
            $table->decimal('score', 5, 2);
            $table->timestamp('issued_at');
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable(); // Issuer, CPD hours, etc.
            $table->timestamps();

            $table->index(['tenant_id', 'user_id']);
            $table->index('expires_at');
        });

        // Knowledge Base Articles
        Schema::create('kb_articles', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('title');
            $table->string('category'); // Assets/Treatment/Safety/Customer/Finance/IT
            $table->json('tags')->nullable();
            $table->longText('content'); // Rich text
            $table->json('attachments')->nullable(); // URLs to media
            $table->integer('version')->default(1);
            $table->string('status')->default('draft'); // draft/review/published
            $table->foreignId('author_id')->constrained('users')->onDelete('restrict');
            $table->json('reviewers')->nullable(); // Array of user IDs
            $table->foreignId('approver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status', 'category']);
            $table->fullText(['title', 'content']);
        });

        // Standard Operating Procedures (SOPs)
        Schema::create('sops', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('code')->unique(); // SOP-XXX-YYY
            $table->string('title');
            $table->string('category');
            $table->json('metadata')->nullable(); // Owner, department, etc.
            $table->json('content')->nullable(); // Structured steps
            $table->integer('version')->default(1);
            $table->string('status')->default('draft');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('next_review_due')->nullable();
            $table->foreignId('approver_id')->nullable()->constrained('users');
            $table->json('attestations')->nullable(); // Who has read/signed
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tenant_id', 'status']);
            $table->index('next_review_due');
        });

        // Skills
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('levels'); // Array: ['Novice', 'Practitioner', 'Proficient', 'Expert']
            $table->string('category'); // technical/safety/customer/leadership
            $table->timestamps();

            $table->index(['tenant_id', 'category']);
        });

        // Employee Skills
        Schema::create('employee_skills', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('skill_id')->constrained('skills')->onDelete('cascade');
            $table->integer('level_index')->default(0); // 0=Novice, 1=Practitioner, etc.
            $table->json('evidence')->nullable(); // Course completions, assessments, supervisor sign-offs
            $table->timestamp('assessed_at')->nullable();
            $table->foreignId('assessor_id')->nullable()->constrained('users');
            $table->timestamps();

            $table->unique(['user_id', 'skill_id']);
            $table->index(['tenant_id', 'level_index']);
        });

        // Rosters
        Schema::create('rosters', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('name'); // Week 1, Fortnight A, etc.
            $table->string('site')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->json('calendar')->nullable(); // Shift assignments
            $table->json('rules')->nullable(); // Min competencies, coverage requirements
            $table->string('status')->default('draft'); // draft/published
            $table->timestamps();

            $table->index(['tenant_id', 'start_date', 'end_date']);
        });

        // On-Call Schedules
        Schema::create('oncall_schedules', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('team'); // Operations, Lab, Emergency Response
            $table->json('ladder'); // Rotation order with user IDs
            $table->date('start_date');
            $table->integer('rotation_days')->default(7);
            $table->json('escalation_rules')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'team']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oncall_schedules');
        Schema::dropIfExists('rosters');
        Schema::dropIfExists('employee_skills');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('sops');
        Schema::dropIfExists('kb_articles');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('assessment_attempts');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('courses');
    }
};
