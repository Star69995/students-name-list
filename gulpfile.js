const gulp = require("gulp");
const replace = require("gulp-replace");
const rename = require("gulp-rename");
const fs = require("fs");
const through2 = require("through2");

const dist = "dist";
const src = "src";

// ===============================
// Local → GAS
// ===============================

// Convert local CSS → GAS HTML (wrap in <style>)
gulp.task("css-to-gas", function () {
    return gulp.src(`${src}/*.css`, { allowEmpty: true })
        .pipe(replace(/([\s\S]*)/, "<style>\n$1\n</style>"))
        .pipe(rename(function (path) {
            path.extname = ".html"; // change output extension to .html
        }))
        .pipe(gulp.dest(dist));
});

// Convert local JS → GAS HTML (wrap in <script>), except code.js
gulp.task("js-to-gas", function () {
    return gulp.src([`${src}/*.js`, `!${src}/code.js`], { allowEmpty: true })
        .pipe(replace(/([\s\S]*)/, "<script>\n$1\n</script>"))
        .pipe(rename(function (path) {
            path.extname = ".html"; // frontend JS → .html
        }))
        .pipe(gulp.dest(dist));
});

// // Convert local code.js → code.gs (backend GAS file)
// gulp.task("js-to-gs", function () {
//     return gulp.src(`${src}/code.js`, { allowEmpty: true })
//         .pipe(rename(function (path) {
//             path.extname = ".gs";   // just rename extension
//         }))
//         .pipe(gulp.dest(dist));
// });

// Convert local index.html → GAS-style (replace <link>/<script> with includes)
gulp.task("html-to-gas", function () {
    return gulp.src(`${src}/index.html`, { allowEmpty: true })
        // Replace any CSS link:
        .pipe(replace(
            /<link rel="stylesheet" href="([^"]+)\.css"\s*\/?>/g,
            (_, p1) => `<?!= include('${p1}'); ?>`
        ))
        // Replace any JS script:
        .pipe(replace(
            /<script src="([^"]+)\.js"><\/script>/g,
            (_, p1) => `<?!= include('${p1}'); ?>`
        ))
        .pipe(gulp.dest(dist));
});

// Copy other assets (images, json, etc.)
gulp.task("assets-to-gas", function () {
    return gulp.src([
        `${src}/**/*`,            // everything inside src
        `!${src}/index.html`,     // exclude main index
        `!${src}/*.css`,          // CSS handled separately
        `!${src}/*.js`,           // JS handled separately
    ], { allowEmpty: true })
        .pipe(gulp.dest(dist));
});

// Grouped conversion
gulp.task("to-gas",
    gulp.series("css-to-gas", "js-to-gas",  "html-to-gas", "assets-to-gas")
);


// ===============================
// GAS → Local (reverse process)
// ===============================

// Convert any HTML with <style> tags → CSS, keeping same base name
gulp.task("gas-to-css", function () {
    return gulp.src(`${dist}/*.html`, { allowEmpty: true })
        .pipe(through2.obj(function (file, _, cb) {
            const contents = file.contents.toString();
            if (/<style[\s\S]*?>[\s\S]*?<\/style>/i.test(contents)) {
                this.push(file);
            }
            cb();
        }))
        .pipe(replace(/<\/?style[^>]*>/g, "")) // remove <style> tags
        .pipe(rename(function (path) {
            path.extname = ".css"; // preserve base name, only change extension
        }))
        .pipe(gulp.dest(src));
});

// Convert any HTML with <script> tags → JS, keeping same base name
gulp.task("gas-to-js", function () {
    return gulp.src(`${dist}/*.html`, { allowEmpty: true })
        .pipe(through2.obj(function (file, _, cb) {
            const contents = file.contents.toString();

            // Skip files that start with DOCTYPE (full HTML documents)
            if (/^\s*<!DOCTYPE\s+html>/i.test(contents)) {
                cb();
                return;
            }

            // Only process files that have script tags with actual JavaScript content
            // Not just script tags referencing external files
            if (/<script(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/i.test(contents)) {
                this.push(file);
            }
            cb();
        }))
        .pipe(replace(/<script(?![^>]*\bsrc\s*=)[^>]*>/g, "")) // remove opening script tags (not src ones)
        .pipe(replace(/<\/script>/g, "")) // remove closing script tags
        .pipe(rename(function (path) {
            path.extname = ".js";
        }))
        .pipe(gulp.dest(src));
});

// Convert GAS index.html → local index.html (replace include with <link>/<script>)
gulp.task("gas-to-html", function () {
    return gulp.src(`${dist}/index.html`, { allowEmpty: true })
        // Convert style/script includes back to <link>/<script>
        .pipe(replace(
            /<\?!= include\('([^']+)'\); \?>/g,
            function (match, p1) {
                // Handle both .css and known style partials
                if (p1.endsWith('.css') || ['styles', 'styles_background'].includes(p1)) {
                    // ensure it ends with .css
                    const href = p1.endsWith('.css') ? p1 : `${p1}.css`;
                    return `<link rel="stylesheet" href="${href}">`;
                } else {
                    return `<script src="${p1}.js"></script>`;
                }
            }
        ))
        .pipe(gulp.dest(src));
});

// // copy *.js to *.gs
// gulp.task("gas-to-gs", function () {
//     return gulp.src(`${dist}/*.js`,
//         { allowEmpty: true }
//     )
//         .pipe(rename(function (path) {
//             path.extname = ".gs";
//         }))
//         .pipe(gulp.dest(src));
// });

// Copy other assets
gulp.task("gas-assets-to-local", function () {
    return gulp.src([`${dist}/**/*`], { allowEmpty: true })
        .pipe(through2.obj(function (file, _, cb) {
            if (file.isDirectory()) {
                this.push(file); // keep folders
            } else if (/\.html$/i.test(file.path)) {
                const contents = file.contents.toString();
                // Only push if it has no <style> or <script> blocks
                if (!/<style[\s\S]*?>[\s\S]*?<\/style>/i.test(contents) &&
                    !/<script[\s\S]*?>[\s\S]*?<\/script>/i.test(contents)) {
                    this.push(file);
                }
            } else {
                // Non-HTML assets always copied
                this.push(file);
            }
            cb();
        }))
        .pipe(gulp.dest(src));
});

// Grouped
gulp.task("to-local", gulp.series("gas-to-css", "gas-to-js", "gas-to-html", "gas-assets-to-local"));




gulp.task("watch", function () {
    gulp.watch(["*.html", "*.css", "*.js"], gulp.series("to-gas"));
});