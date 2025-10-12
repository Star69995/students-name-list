



let formCounter = 1;

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

function createFormFieldLabel(name, label) {
    const labelElement = document.createElement('label');
    labelElement.className = 'input-label';
    labelElement.innerHTML = label;
    labelElement.htmlFor = name;
    const appendit = `<span class="text-red-500">*</span>`;
    labelElement.innerHTML += appendit;

    return labelElement
}

function createFormField(name, type, label, placeholder, options) {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-control';

    const labelElement = createFormFieldLabel(name, label);
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

function createForm() {
    const num = formCounter;
    formCounter++;
    const form = document.createElement('form');
    form.className = 'form-section';

    const section = document.createElement('div');
    section.className = 'form-section';
    section.innerHTML = `<h3 class="text-xl font-semibold text-sky-700 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            fill="#0ea5e9">
                            <path
                                d="M9 12h6m-6-4h6m-6 8h3m3-12H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2z"
                                stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" fill="none" />
                        </svg>
                        מענה מספר ${num} שאני נותן
                    </h3>`
    form.appendChild(section);

    formFields.forEach(field => {
        const fieldContainer = createFormField(`${field.id}${num}`, field.type, field.label, field.placeholder, field.options);
        form.appendChild(fieldContainer);
    });

    document.getElementById('responseSectionsContainer').appendChild(form);
}

// TODO: add ability to remove responses

document.getElementById('addResponseBtn').addEventListener('click', function () {
    createForm();
});

// function renumberResponseSections() {
//     const sections = document.querySelectorAll('[id^="responseSection"]');
//     let newIndex = 1;

//     sections.forEach(section => {
//         const oldIndex = section.id.replace('responseSection', '');

//         if (oldIndex != newIndex) {
//             // Update section ID
//             section.id = `responseSection${newIndex}`;

//             // Update heading
//             const heading = section.querySelector('h3');
//             heading.innerHTML = heading.innerHTML.replace(`מענה מספר ${oldIndex} שאני נותן`, `מענה מספר ${newIndex} שאני נותן`);

//             // Update remove button data attribute
//             const removeBtn = section.querySelector('.remove-response-btn');
//             if (removeBtn) {
//                 removeBtn.setAttribute('data-response', newIndex);
//             }

//             // Update all input IDs and labels
//             updateElementIds(section, oldIndex, newIndex);
//         }

//         newIndex++;
//     });

//     // Update current response count
//     formCounter = newIndex - 1;
// }


// function updateElementIds(section, oldIndex, newIndex) {
//     // Update select elements
//     ['responseType', 'grade', 'day', 'hour'].forEach(prefix => {
//         const element = document.getElementById(`${prefix}${oldIndex}`);
//         if (element) {
//             element.id = `${prefix}${newIndex}`;
//             // Update associated label
//             const label = section.querySelector(`label[for="${prefix}${oldIndex}"]`);
//             if (label) {
//                 label.setAttribute('for', `${prefix}${newIndex}`);
//             }
//         }
//     });

//     // Update class checkboxes
//     const checkboxContainer = section.querySelector(`#classCheckboxes${oldIndex}`);
//     if (checkboxContainer) {
//         checkboxContainer.id = `classCheckboxes${newIndex}`;

//         const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
//         checkboxes.forEach(checkbox => {
//             const classNum = checkbox.value;
//             checkbox.id = `class${newIndex}_${classNum}`;
//             checkbox.setAttribute('data-response', newIndex);

//             // Update associated label
//             const label = checkboxContainer.querySelector(`label[for="class${oldIndex}_${classNum}"]`);
//             if (label) {
//                 label.setAttribute('for', `class${newIndex}_${classNum}`);
//             }
//         });
//     }

//     // Update students container
//     const studentsContainer = section.querySelector(`#studentsContainer${oldIndex}`);
//     if (studentsContainer) {
//         studentsContainer.id = `studentsContainer${newIndex}`;
//     }

//     // Re-setup event listeners
//     setupClassCheckboxes(newIndex);
//     document.getElementById(`grade${newIndex}`).addEventListener('change', function () {
//         updateClassCheckboxes(newIndex);
//     });
// }





