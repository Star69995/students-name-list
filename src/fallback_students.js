





// Mock data fallback
function getMockStudentData() {
    return {
        'ז': {
            '1': [
                { lastName: 'כהן', firstName: 'דניאל' },
                { lastName: 'לוי', firstName: 'נועה' },
                { lastName: 'אברהם', firstName: 'יוסי' },
                { lastName: 'דוד', firstName: 'מיכל' }
            ],
            '2': [
                { lastName: 'שמואלי', firstName: 'רותם' },
                { lastName: 'גולן', firstName: 'אביב' },
                { lastName: 'אדרי', firstName: 'שירה' },
                { lastName: 'ברק', firstName: 'עידו' }
            ],
            '3': [
                { lastName: 'אלון', firstName: 'גל' },
                { lastName: 'נחום', firstName: 'שקד' }
            ],
            '4': [
                { lastName: 'שרון', firstName: 'עומר' },
                { lastName: 'פרץ', firstName: 'הילה' }
            ],
            '5': [
                { lastName: 'אשכנזי', firstName: 'אורי' },
                { lastName: 'מזרחי', firstName: 'ליאור' }
            ],
            '6': [
                { lastName: 'דהן', firstName: 'יובל' },
                { lastName: 'חן', firstName: 'נועם' }
            ],
            '7': [
                { lastName: 'אוחיון', firstName: 'אלה' },
                { lastName: 'ביטון', firstName: 'איתי' }
            ]
        },
        'ח': {
            '1': [
                { lastName: 'רוזנברג', firstName: 'טל' },
                { lastName: 'פרידמן', firstName: 'מאיה' }
            ],
            '2': [
                { lastName: 'גרינברג', firstName: 'אלון' },
                { lastName: 'שטרן', firstName: 'שיר' }
            ],
            '3': [
                { lastName: 'ויס', firstName: 'עדי' },
                { lastName: 'קליין', firstName: 'רון' }
            ],
            '4': [
                { lastName: 'הופמן', firstName: 'דנה' },
                { lastName: 'ברגר', firstName: 'אסף' }
            ],
            '5': [
                { lastName: 'זילברמן', firstName: 'יעל' },
                { lastName: 'גולדשטיין', firstName: 'אריאל' }
            ],
            '6': [
                { lastName: 'פלדמן', firstName: 'נדב' },
                { lastName: 'הירש', firstName: 'מיה' }
            ],
            '7': [
                { lastName: 'שוורץ', firstName: 'אופיר' },
                { lastName: 'לוינסון', firstName: 'שני' }
            ]
        },
        'ט': {
            '1': [
                { lastName: 'כץ', firstName: 'יותם' },
                { lastName: 'רוזן', firstName: 'נטע' }
            ],
            '2': [
                { lastName: 'פרץ', firstName: 'אגם' },
                { lastName: 'אזולאי', firstName: 'עמית' }
            ],
            '3': [
                { lastName: 'מלכה', firstName: 'ליאם' },
                { lastName: 'אוחנה', firstName: 'אביגיל' }
            ],
            '4': [
                { lastName: 'גבאי', firstName: 'אלעד' },
                { lastName: 'דיין', firstName: 'הדר' }
            ],
            '5': [
                { lastName: 'חדד', firstName: 'אורי' },
                { lastName: 'אטיאס', firstName: 'נויה' }
            ],
            '6': [
                { lastName: 'סויסה', firstName: 'רועי' },
                { lastName: 'בוזגלו', firstName: 'מאי' }
            ],
            '7': [
                { lastName: 'אלמליח', firstName: 'דור' },
                { lastName: 'אמסלם', firstName: 'שירי' }
            ]
        }
    };
}

// Create a global reference that works in both environments
globalThis.getMockStudentData = getMockStudentData;





