





  // Function to load student data from Google Sheets
function loadStudentsData() {
    console.log("Loading students data...");
    try {
        google.script.run
            .withSuccessHandler(onStudentsDataLoaded)
            .withFailureHandler(onStudentsDataError)
            .getStudentsData();
        console.log("data loaded");
    } catch (error) {
        console.error('Error loading students data:', error);
        onStudentsDataError();
    }
}

function onFinally(){
    // console.log("Finished loading students data.");
    // Hide loading overlay and show error
    document.getElementById('loadingOverlay').style.display = 'none';
    createForm();


    // Submit form
    document.getElementById('submitBtn').addEventListener('click', function () {
        if (validateForm()) {
            submitForm();
        }
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}
// Success handler for loading students data
function onStudentsDataLoaded(data) {
    // console.log('data: ', data);
    // Find the students field and update its options
    const studentsField = formFields.find(field => field.id === 'students');
    if (studentsField) {
        studentsField.options = data;
    }
    onFinally()
}

// Error handler for loading students data
function onStudentsDataError() {
    // Show error message but continue with mock data
    showMessage('התרחשה שגיאה בטעינת נתוני התלמידים. האפליקציה פועלת עם נתונים לדוגמה.', 'warning');
    onFinally()
}





