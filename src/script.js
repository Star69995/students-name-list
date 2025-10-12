// Global variable to store student data from Google Sheets
// let studentsData = {};
let currentResponseCount = 1;
const MAX_RESPONSES = 10;

// Load students data when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadStudentsData();
});

// Show message function
function showMessage(message, type = 'error') {
    let errorDiv;
    if (message.includes('תלמידים')) {
        errorDiv = document.getElementById('errorMessage');
    } else {
        errorDiv = document.getElementById('errorMessageBottom');
    }

    const errorText = document.getElementById('errorText');
    const successDiv = document.getElementById('successMessage');

    if (type === 'success') {
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        // When showing the message
        successDiv.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    } else {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
    }
}

function validateForm() {
    // Basic validation for required fields
    const teacherNameElement = document.getElementById('teacherName');
    const teacherName = teacherNameElement.value.trim();
    if (!teacherName) {
        alert('נא להזין שם מלא');
        teacherNameElement.focus();
        return false;
    }

    const responseSectionsContainer = document.getElementById('responseSectionsContainer');

    // Get all forms within the container
    const forms = responseSectionsContainer.querySelectorAll('form');

    // Process each form separately
    for (const form of forms) {
        // Check for students
        const students = form.querySelectorAll('input[type="checkbox"]:checked');
        if (students.length === 0) {
            alert('יש לבחור לפחות תלמיד אחד בכל מענה');
            return false;
        }

        // Check response type
        const helpType = form.querySelector("[id*='helpType']");
        if (!helpType || !helpType.value.trim()) {
            alert('יש לבחור סוג מענה');
            helpType?.focus();
            return false;
        }

        // Check time slots
        const timeSlotsContainer = form.querySelector('[id^="timeSlotsContainer"]');
        const timeSlots = timeSlotsContainer.querySelectorAll('.time-slot-container');

        for (const slot of timeSlots) {
            const daySelect = slot.querySelector('select[id^="day"]');
            const hourSelect = slot.querySelector('select[id^="hour"]');

            if (!daySelect || !daySelect.value.trim()) {
                alert('יש לבחור יום בכל מועד');
                daySelect?.focus();
                return false;
            }

            if (!hourSelect || !hourSelect.value.trim()) {
                alert('יש לבחור שעה בכל מועד');
                hourSelect?.focus();
                return false;
            }
        }
    }

    return true;
}

function submitForm() {
    // Validate form first
    if (!validateForm()) {
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'שולח...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = {
        teacherName: document.getElementById('teacherName').value,
        responses: []
    };

    const responseSectionsContainer = document.getElementById('responseSectionsContainer');

    // Get all forms within the container
    const forms = responseSectionsContainer.querySelectorAll('form');

    // Process each form separately
    for (const form of forms) {
        const responseDataArray = collectResponseData(form);
        // Add all responses (split by time slots) to the array
        formData.responses.push(...responseDataArray);
    }

    // console.log('Form data to submit:', formData);

    // Send data to Google Apps Script
    try {
        google.script.run
            .withSuccessHandler(onFormSubmitSuccess)
            .withFailureHandler(onFormSubmitError)
            .saveFormData(formData);
    } catch (error) {
        console.error('Error submitting form:', error);
        onFormSubmitError(error);
    }
}

function onFormSubmitSuccess(result) {
    console.log('Form submitted successfully:', result);

    // Reset submit button
    const submitBtn = document.getElementById('submitBtn');
    const originalText = 'טופס נשלח בהצלחה';
    submitBtn.textContent = originalText;

    disableForm();

    showMessage(result.message || 'שגיאה בשמירת הנתונים', 'success');
}

function onFormSubmitError(error) {
    console.error('Error submitting form:', error);

    // Reset submit button
    const submitBtn = document.getElementById('submitBtn');
    const originalText = 'שלח טופס';
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    showMessage('שגיאה בשליחת הטופס: ' + (error.message || error));
}

function disableForm() {
    // Disable all input elements (text, email, number, password, etc.)
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = true;
        input.readOnly = true; // Extra protection for text inputs
    });

    // Disable all textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.disabled = true;
        textarea.readOnly = true;
    });

    // Disable all select dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.disabled = true;
    });

    // Disable all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
    });

    // Optional: Add visual indication that form is disabled
    const form = document.querySelector('form');
    if (form) {
        form.style.opacity = '0.6';
        form.style.cursor = 'not-allowed';
    }
}

/**
 * Collects response data from a form and splits it into multiple responses
 * if there are multiple time slots
 * @param {HTMLFormElement} form - The form element to collect data from
 * @returns {Array} Array of response objects, one per time slot
 */
function collectResponseData(form) {
    // Get basic response data
    const responseType = form.querySelector("[id*='helpType']").value;
    const students = parseStudentData(form.querySelectorAll('input[type="checkbox"]:checked'));

    // Get all time slots for this form
    const timeSlotsContainer = form.querySelector('[id^="timeSlotsContainer"]');
    const timeSlots = timeSlotsContainer.querySelectorAll('.time-slot-container');

    // Create an array to hold all responses
    const responses = [];

    // For each time slot, create a separate response object
    timeSlots.forEach(slot => {
        const daySelect = slot.querySelector('select[id^="day"]');
        const hourSelect = slot.querySelector('select[id^="hour"]');

        const responseData = {
            responseType: responseType,
            day: daySelect.value,
            hour: hourSelect.value,
            students: students // Same students for all time slots
        };

        responses.push(responseData);
    });

    return responses;
}

/**
 * Parses student data from checked checkboxes
 * @param {NodeList} studentsNodeList - NodeList of checked checkbox inputs
 * @returns {Array} Array of student objects
 */
function parseStudentData(studentsNodeList) {
    const students = [];

    studentsNodeList.forEach(input => {
        const label = input.nextElementSibling;

        if (label) {
            // Parse from label text: "נועה לוי - כיתה ז' 1"
            const fullText = label.textContent.trim();
            const [namePart, classPart] = fullText.split(' - ');

            // Extract class info
            const classMatch = classPart?.match(/כיתה ([א-ת])'?\s*(\d+)/);
            const grade = classMatch ? classMatch[1] : '';
            const classNumber = classMatch ? classMatch[2] : '';

            students.push({
                name: namePart.trim(),
                grade: grade,
                class: classNumber,
                fullClassName: classPart?.trim() || '',
            });
        }
    });

    return students;
}