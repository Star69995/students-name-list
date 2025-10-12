let formCounter = 1;
let timeSlotCounters = {}; // Track time slot counters for each form

// ================================================================
// Create search student Field
// ================================================================

function createSearchFormField(field, name, placeholder, options) {
    // Create container for the search field and selected items
    const container = document.createElement('div');
    container.className = 'search-select-container';

    // Create the search input
    field = document.createElement('input');
    field.type = 'text';
    field.name = name + '_search';
    field.id = name + '_search';
    field.className = 'input-field search-input';
    field.placeholder = placeholder || 'חפש תלמידים...';
    field.autocomplete = 'off';

    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown hidden';
    dropdown.id = name + '_dropdown';

    // Create selected items container
    const selectedContainer = document.createElement('div');
    selectedContainer.className = 'selected-items-container';
    selectedContainer.id = name + '_selected';

    // Hidden input to store selected values
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = name;
    hiddenInput.id = name;

    // Store selected students
    const selectedStudents = new Set();

    // Flatten student data for easier searching
    const allStudents = [];
    Object.entries(options).forEach(([grade, classes]) => {
        Object.entries(classes).forEach(([classNum, students]) => {
            students.forEach(student => {
                allStudents.push({
                    id: `${grade}_${classNum}_${student.lastName}_${student.firstName}`,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    grade: grade,
                    classNum: classNum,
                    fullName: `${student.firstName} ${student.lastName}`,
                    classDisplay: `${grade}' ${classNum}`
                });
            });
        });
    });

    const itemInnerHTML = (student) => {
        return `
        <span class="student-name">${student.fullName}</span>
        <span class="student-class">כיתה ${student.classDisplay}</span>
    `
    }
    // Function to update dropdown based on search
    function updateDropdown(searchTerm) {
        dropdown.innerHTML = '';
        const filteredStudents = allStudents.filter(student =>
            student.fullName.includes(searchTerm) ||
            student.firstName.includes(searchTerm) ||
            student.lastName.includes(searchTerm) ||
            student.classDisplay.includes(searchTerm)
        );

        if (filteredStudents.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-item no-results">לא נמצאו תוצאות</div>';
        } else {
            filteredStudents.forEach(student => {
                if (!selectedStudents.has(student.id)) {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.innerHTML = itemInnerHTML(student)
                    item.addEventListener('click', () => selectStudent(student));
                    dropdown.appendChild(item);
                }
            });
        }

        dropdown.classList.remove('hidden');
    }

    // Function to select a student
    function selectStudent(student) {
        selectedStudents.add(student.id);

        // Create selected item element
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-item';
        selectedItem.dataset.studentId = student.id;
        selectedItem.innerHTML = `
            <input type="checkbox" id="${name}_student_${student.id}" checked>
            <label for="${name}_student_${student.id}">
                ${student.fullName} - כיתה ${student.classDisplay}
            </label>
        `;

        // Add event listener to checkbox for removal
        const checkbox = selectedItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function () {
            if (!this.checked) {
                selectedStudents.delete(student.id);
                selectedItem.remove();
                updateHiddenInput();
            }
        });

        selectedContainer.appendChild(selectedItem);
        field.value = '';
        dropdown.classList.add('hidden');
        updateHiddenInput();
    }

    // Function to update hidden input with selected values
    function updateHiddenInput() {
        hiddenInput.value = Array.from(selectedStudents).join(',');
    }

    function showAllStudents() {
        dropdown.innerHTML = '';
        allStudents.forEach(student => {
            if (!selectedStudents.has(student.id)) {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = itemInnerHTML(student)
                item.addEventListener('click', () => selectStudent(student));
                dropdown.appendChild(item);
            }
        });

        if (dropdown.children.length > 0) {
            dropdown.classList.remove('hidden');
        }
    }

    // Event listeners
    field.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        if (searchTerm.length > 0) {
            updateDropdown(searchTerm);
        } else {
            showAllStudents(); // Show all students when input is empty
        }
    });

    field.addEventListener('focus', () => {
        if (field.value.length > 0) {
            updateDropdown(field.value);
        } else {
            showAllStudents(); // Show all students on focus
        }
    });

    field.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the dropdown from closing immediately
        if (field.value.length > 0) {
            updateDropdown(field.value);
        } else {
            showAllStudents(); // Show all students on click
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Assemble the component
    container.appendChild(field);
    container.appendChild(dropdown);
    container.appendChild(selectedContainer);
    container.appendChild(hiddenInput);

    return container;
}

// ================================================================
// Create Form Field
// ================================================================

function createFormFieldLabel(name, label, required = true) {
    const labelElement = document.createElement('label');
    labelElement.className = 'input-label';
    labelElement.innerHTML = label;
    labelElement.htmlFor = name;
    if (required) {
        const appendit = `<span class="text-red-500">*</span>`;
        labelElement.innerHTML += appendit;
    }

    return labelElement
}

function createFormField(name, type, label, placeholder, options, required = true) {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-control';

    const labelElement = createFormFieldLabel(name, label, required);
    fieldContainer.appendChild(labelElement);

    let field
    if (type === 'select') {
        field = document.createElement('select');
        field.name = name;
        field.id = name;
        field.className = 'input-field';

        if (placeholder) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = placeholder;
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            field.appendChild(placeholderOption);
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            field.appendChild(optionElement);
        });
    } else if (type === 'checkbox-select') {
        field = document.createElement('div');
        field.name = name;
        field.id = name;
        field.className = 'class-checkbox-container';

        options.forEach(option => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option;
            checkbox.id = `${name}-${option}`;
            checkbox.className = 'class-checkbox';
            checkbox.setAttribute('data-response', name);

            const label = document.createElement('label');
            label.htmlFor = `${name}-${option}`;
            label.textContent = `כיתה ${option}`;

            const classContainer = document.createElement('div');
            classContainer.className = 'class-container';
            classContainer.appendChild(checkbox);
            classContainer.appendChild(label);

            field.appendChild(classContainer);
        });
    } else if (type === 'search-select') {
        field = createSearchFormField(field, name, placeholder, options);
    }

    fieldContainer.appendChild(field);

    return fieldContainer;
}

// ================================================================
// Create Time Slot
// ================================================================

function createTimeSlot(formNum, slotNum, dayOptions, hourOptions) {
    const timeSlotContainer = document.createElement('div');
    timeSlotContainer.className = 'time-slot-container bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3';
    timeSlotContainer.dataset.slotNum = slotNum;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex items-center justify-between mb-3';

    const slotTitle = document.createElement('h4');
    slotTitle.className = 'text-md font-medium text-gray-700';
    slotTitle.textContent = `יום ושעה #${slotNum}`;

    const removeSlotBtn = document.createElement('button');
    removeSlotBtn.type = 'button';
    removeSlotBtn.className = 'text-red-500 hover:text-red-700 text-sm font-medium transition';
    removeSlotBtn.innerHTML = '✖ הסר';

    removeSlotBtn.addEventListener('click', () => {
        timeSlotContainer.remove();
        renumberTimeSlots(formNum);
    });

    headerDiv.appendChild(slotTitle);
    if (slotNum > 1) { // Don't show remove button for first slot
        headerDiv.appendChild(removeSlotBtn);
    }

    timeSlotContainer.appendChild(headerDiv);

    const fieldsDiv = document.createElement('div');
    fieldsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

    // Day field
    const dayField = createFormField(
        `day${formNum}_${slotNum}`,
        'select',
        'יום',
        'בחר יום',
        dayOptions,
        true
    );

    // Hour field
    const hourField = createFormField(
        `hour${formNum}_${slotNum}`,
        'select',
        'שעה',
        'בחר שעה',
        hourOptions,
        true
    );

    fieldsDiv.appendChild(dayField);
    fieldsDiv.appendChild(hourField);
    timeSlotContainer.appendChild(fieldsDiv);

    return timeSlotContainer;
}

// ================================================================
// Renumber Time Slots
// ================================================================

function renumberTimeSlots(formNum) {
    const timeSlotsContainer = document.getElementById(`timeSlotsContainer${formNum}`);
    const slots = timeSlotsContainer.querySelectorAll('.time-slot-container');

    slots.forEach((slot, index) => {
        const newSlotNum = index + 1;
        slot.dataset.slotNum = newSlotNum;

        // Update title
        const title = slot.querySelector('h4');
        title.textContent = `יום ושעה #${newSlotNum}`;

        // Update field IDs and names
        const daySelect = slot.querySelector('select[id^="day"]');
        const hourSelect = slot.querySelector('select[id^="hour"]');
        const dayLabel = slot.querySelector('label[for^="day"]');
        const hourLabel = slot.querySelector('label[for^="hour"]');

        if (daySelect) {
            daySelect.id = `day${formNum}_${newSlotNum}`;
            daySelect.name = `day${formNum}_${newSlotNum}`;
            if (dayLabel) dayLabel.htmlFor = `day${formNum}_${newSlotNum}`;
        }

        if (hourSelect) {
            hourSelect.id = `hour${formNum}_${newSlotNum}`;
            hourSelect.name = `hour${formNum}_${newSlotNum}`;
            if (hourLabel) hourLabel.htmlFor = `hour${formNum}_${newSlotNum}`;
        }

        // Show/hide remove button
        const removeBtn = slot.querySelector('button');
        if (removeBtn) {
            if (newSlotNum === 1) {
                removeBtn.classList.add('hidden');
            } else {
                removeBtn.classList.remove('hidden');
            }
        }
    });

    timeSlotCounters[formNum] = slots.length;
}

// ================================================================
// Create Form
// ================================================================

function createForm() {
    const num = formCounter;
    formCounter++;
    timeSlotCounters[num] = 1; // Initialize time slot counter

    const form = document.createElement('form');
    form.className = 'form-section';
    form.id = `responseForm${num}`;

    const section = document.createElement('div');
    section.className = 'form-section';
    section.innerHTML = `
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-sky-700 flex items-center">
            <svg class="w-6 h-6 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="#0ea5e9">
                <path
                    d="M9 12h6m-6-4h6m-6 8h3m3-12H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z"
                    stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" fill="none" />
            </svg>
            מענה מספר ${num} שאני נותן
        </h3>

        <button type="button" class="remove-response-btn text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 font-medium text-sm"
                data-response="${num}">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            מחק מענה זה
        </button>
    </div>
    `;
    form.appendChild(section);

    // Add regular form fields (except day and hour)
    const fieldsToAdd = formFields.filter(field => field.id !== 'day' && field.id !== 'hour');
    fieldsToAdd.forEach(field => {
        const fieldContainer = createFormField(
            `${field.id}${num}`,
            field.type,
            field.label,
            field.placeholder,
            field.options
        );
        form.appendChild(fieldContainer);
    });

    // Create time slots section
    const timeSlotsSection = document.createElement('div');
    timeSlotsSection.className = 'form-control';

    const timeSlotsLabel = document.createElement('div');
    timeSlotsLabel.className = 'flex items-center justify-between mb-3';
    timeSlotsLabel.innerHTML = `
        <label class="input-label">
            ימים ושעות
            <span class="text-red-500">*</span>
        </label>
    `;

    timeSlotsSection.appendChild(timeSlotsLabel);

    // Container for time slots
    const timeSlotsContainer = document.createElement('div');
    timeSlotsContainer.id = `timeSlotsContainer${num}`;
    timeSlotsContainer.className = 'space-y-3';

    // Find day and hour options from formFields
    const dayField = formFields.find(f => f.id === 'day');
    const hourField = formFields.find(f => f.id === 'hour');

    // Add first time slot
    const firstSlot = createTimeSlot(num, 1, dayField.options, hourField.options);
    timeSlotsContainer.appendChild(firstSlot);

    timeSlotsSection.appendChild(timeSlotsContainer);

    // Add time slot button
    const addTimeSlotBtn = document.createElement('button');
    addTimeSlotBtn.type = 'button';
    addTimeSlotBtn.className = 'mt-3 mx-auto text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 font-medium text-sm border border-sky-300 hover:border-sky-500';
    addTimeSlotBtn.innerHTML = `
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        הוסף יום ושעה נוספים
    `;

    addTimeSlotBtn.addEventListener('click', () => {
        timeSlotCounters[num]++;
        const newSlot = createTimeSlot(num, timeSlotCounters[num], dayField.options, hourField.options);
        timeSlotsContainer.appendChild(newSlot);
    });

    timeSlotsSection.appendChild(addTimeSlotBtn);
    form.appendChild(timeSlotsSection);

    // Add event listener to the delete button
    const removeBtn = form.querySelector('.remove-response-btn');
    removeBtn.addEventListener('click', () => {
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        confirmDialog.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">אישור מחיקה</h3>
            <p class="text-gray-600 mb-6">האם אתה בטוח שברצונך למחוק מענה מספר ${num}?</p>
            <div class="flex gap-3 justify-end">
                <button class="cancel-btn px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium">
                    ביטול
                </button>
                <button class="confirm-btn px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium">
                    מחק
                </button>
            </div>
        </div>
        `;

        document.body.appendChild(confirmDialog);

        confirmDialog.querySelector('.cancel-btn').addEventListener('click', () => {
            confirmDialog.remove();
        });

        confirmDialog.querySelector('.confirm-btn').addEventListener('click', () => {
            confirmDialog.remove();
            form.remove();
            delete timeSlotCounters[num];
            renumberResponseSections();
        });

        confirmDialog.addEventListener('click', (e) => {
            if (e.target === confirmDialog) {
                confirmDialog.remove();
            }
        });
    });

    document.getElementById('responseSectionsContainer').appendChild(form);
}

// ================================================================
// Renumber Response Sections
// ================================================================

function renumberResponseSections() {
    const sections = document.querySelectorAll('.form-section');
    let newIndex = 1;

    sections.forEach(section => {
        const headerText = section.querySelector('h3');
        if (headerText) {
            headerText.innerHTML = headerText.innerHTML.replace(/מענה מספר \d+/,
                `מענה מספר ${newIndex}`);
        }

        const removeBtn = section.querySelector('.remove-response-btn');
        if (removeBtn) {
            removeBtn.setAttribute('data-response', newIndex);
        }

        section.id = `responseForm${newIndex}`;
        newIndex++;
    });

    formCounter = newIndex;
}

// ================================================================
// Event Listeners
// ================================================================

document.getElementById('addResponseBtn').addEventListener('click', function () {
    createForm();
});