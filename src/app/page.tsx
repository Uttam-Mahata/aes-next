'use client';

import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { PlusIcon, EditIcon } from 'lucide-react';

interface SubjectQuestion {
  type: string;
  sampleQuestions: string[];
}

interface Subject {
  name: string;
  description: string;
  questionTypes: SubjectQuestion[];
  weightage: string;
}

interface ExamData {
  examName: string;
  totalSubjects: number;
  subjects: Subject[];
}

export default function Home() {
  const [examName, setExamName] = useState('');
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examFormat, setExamFormat] = useState<{
    sections: {
      numQuestions: number;
      numOfMaxAttemptableQuestions: number;
      marksPerQuestion: number;
      negativeMarking: number;
      type: string;
    }[];
  } | null>(null);
  const [editingSubject, setEditingSubject] = useState<{
    subjectIndex: number | null;
    isAddingNew: boolean;
  }>({ subjectIndex: null, isAddingNew: false });
  const [showExamFormatModal, setShowExamFormatModal] = useState(false);

  const generateSubjects = async () => {
    if (!examName.trim()) {
      setError('Please enter an exam name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examName }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate subjects');
      }

      const data: ExamData = await response.json();
      setExamData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExamFormat = (index: number) => {
    setEditingSubject({ subjectIndex: index, isAddingNew: false });
    setShowExamFormatModal(true);
  };

  const saveExamFormat = (sections: NonNullable<typeof examFormat>["sections"]) => {
    setExamFormat({ sections });
    setShowExamFormatModal(false);
  };

  const createExam = () => {
    if (!examFormat) {
      setError('Please define an exam format first.');
      return;
    }

    const fullMarks = examFormat.sections.reduce(
      (sum, section) => sum + section.numQuestions * section.marksPerQuestion,
      0
    );

    const examDetails = {
      examName: examData?.examName,
      fullMarks,
      time: 120, // Example, ask for user input
      subjects: examData?.subjects || [],
      format: examFormat,
    };

    console.log('Exam Details:', examDetails);
    // Add API call or further processing here
  };

  const renderSubjectActions = (index: number) => (
    <div className="flex space-x-2 mt-2">
      <button
        onClick={() => handleAddExamFormat(index)}
        className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
      >
        <PlusIcon size={16} className="mr-1" /> Add Exam Format
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Exam Subject Generator
        </h1>
        
        <div className="mb-4">
          <label htmlFor="examName" className="block text-sm font-medium text-gray-700">
            Exam Name
          </label>
          <input
            type="text"
            id="examName"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Enter exam name"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={generateSubjects}
            disabled={loading}
            className="flex-grow bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Exam Breakdown'}
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 mt-2 text-sm text-center">{error}</p>
        )}
        
        {examData && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {examData.examName} - Exam Breakdown
            </h2>
            <p className="mb-4 text-gray-600">
              Total Subjects: {examData.totalSubjects}
            </p>

            <div className="space-y-4">
              {examData.subjects.map((subject, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-md border border-gray-200 relative"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{subject.description}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Weightage: {subject.weightage}
                  </p>
                  
                  {renderSubjectActions(index)}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={createExam}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Create Exam
              </button>
            </div>
          </div>
        )}
      </Card>

      {showExamFormatModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Define Exam Format</h2>
      <form>
        {examFormat?.sections.map((section, i) => (
          <div key={i} className="mb-4 border-b pb-4">
            <h3 className="font-medium text-gray-700">Section {i + 1}</h3>
            <div className="flex space-x-2 items-center mb-2">
              <label className="block text-sm font-medium">
                Total Questions
                <input
                  type="number"
                  value={section.numQuestions}
                  onChange={(e) => {
                    const updatedSections = [...(examFormat.sections || [])];
                    updatedSections[i].numQuestions = parseInt(e.target.value, 10);
                    setExamFormat({ sections: updatedSections });
                  }}
                  className="mt-1 block w-24 border-gray-300 rounded-md"
                  placeholder="0"
                />
              </label>
              {/* Maximum number of questions that can be attempted */}
              <label className="block text-sm font-medium">
                Maximum Attemptable Question
               <input type="number"
                  value={section.numOfMaxAttemptableQuestions}
                  onChange={(e) => {
                    const updatedSections = [...(examFormat.sections || [])];
                    updatedSections[i].numOfMaxAttemptableQuestions = parseInt(e.target.value, 10);
                    setExamFormat({ sections: updatedSections });
                  }}
                  className="mt-1 block w-24 border-gray-300 rounded-md"
                  placeholder="0" />
              </label>

              <label className="block text-sm font-medium">
                Marks/Q
                <input
                  type="number"
                  value={section.marksPerQuestion}
                  onChange={(e) => {
                    const updatedSections = [...(examFormat.sections || [])];
                    updatedSections[i].marksPerQuestion = parseInt(e.target.value, 10);
                    setExamFormat({ sections: updatedSections });
                  }}
                  className="mt-1 block w-24 border-gray-300 rounded-md"
                  placeholder="0"
                />
              </label>
              <label className="block text-sm font-medium">
                Neg. Marks
                <input
                  type="number"
                  value={section.negativeMarking}
                  onChange={(e) => {
                    const updatedSections = [...(examFormat.sections || [])];
                    updatedSections[i].negativeMarking = parseFloat(e.target.value);
                    setExamFormat({ sections: updatedSections });
                  }}
                  className="mt-1 block w-24 border-gray-300 rounded-md"
                  placeholder="0"
                />
              </label>
            </div>
            <label className="block text-sm font-medium mb-2">
              Question Type
              <select
                value={section.type || ''}
                onChange={(e) => {
                  const updatedSections = [...(examFormat.sections || [])];
                  updatedSections[i].type = e.target.value;
                  setExamFormat({ sections: updatedSections });
                }}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">Select Type</option>
                <option value="MCQ">MCQ</option>
                <option value="SAQ">Short Answer</option>
                <option value="Numerical">Numerical</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                const updatedSections = [...(examFormat.sections || [])];
                updatedSections.splice(i, 1);
                setExamFormat({ sections: updatedSections });
              }}
              className="text-red-500 text-sm hover:underline"
            >
              Remove Section
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            const updatedSections = [
              ...(examFormat?.sections || []),
              {
                numQuestions: 0,
                numOfMaxAttemptableQuestions: 0,
                marksPerQuestion: 0,
                negativeMarking: 0,
                type: '',
              },
            ];
            setExamFormat({ sections: updatedSections });
          }}
          className="mt-4 text-green-600 hover:text-green-700"
        >
          + Add Section
        </button>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={() => setShowExamFormatModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => saveExamFormat(examFormat?.sections || [])}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}
