



const formFields = [
    {
        id: 'helpType',
        type: 'select',
        label: 'איזה סוג מענה אני נותן?',
        placeholder: 'בחר סוג מענה',
        options: [

            'שילוב',
            'אל"ה',
            'סל אישי',
            'מורה באמצעות',
            'פרטני-אנגלית',
            'פרטני-מתמטיקה',
            'פרטני-מדעים',
            'פרטני-עברית',
            'פרטני-ערבית',
            'פרטני-היסטוריה',
            'פרטני-במקרא',
            'פרטני-באמנות',
            'פרטני-כללי',
            'הסלון',
            'הכלה רגשית',
            'הכלה לימודית',
            'הכלה בספורט',]
    },
    // {
    //     id: 'grade',
    //     type: 'select',
    //     label: 'השכבה בה אני נותן מענה זה',
    //     placeholder: 'בחר שכבה',
    //     options: ['ז', 'ח', 'ט']
    // },
    // {
    //     id: 'class',
    //     type: 'checkbox-select',
    //     label: 'באיזה כיתה/כיתות אני נותן את המענה?',
    //     options: ['1', '2', '3', '4', '5', '6', '7']
    // },
    {
        id: 'students',
        type: 'search-select',
        label: `בחר את התלמידים להם אתה נותן מענה זה<br><span class="text-sm text-gray-600">כתוב את שם התלמיד ולחץ עליו מתוך הרשימה הנפתחת</span>`,
        placeholder: 'שם התלמיד',
        options: getMockStudentData()
    },
    {
        id: 'day',
        type: 'select',
        label: 'באיזה יום בשבוע אני נותן את המענה?',
        placeholder: 'בחר יום',
        options: ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'']
    },
    {
        id: 'hour',
        type: 'select',
        label: 'באיזו שעה במערכת אני נותן את המענה?',
        placeholder: 'בחר שעה',
        options: ['0', '1', '2', '3', '4', '5', '6', '7', '8']
    }
]

// Create a global reference that works in both environments
globalThis.formFields = formFields;



