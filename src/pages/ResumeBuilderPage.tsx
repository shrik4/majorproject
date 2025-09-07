import React, { useState, useEffect, useRef } from 'react';

// --- Helper Components ---

// Simple loading spinner component
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Icon for the magic wand (Enhance with AI button)
const MagicWandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 4V2" /><path d="M15 10V8" /><path d="M12.5 7H17.5" /><path d="M9.5 7H2" />
    <path d="M18 13v-2" /><path d="M18 22v-2" /><path d="M21.5 16.5H14.5" /><path d="M11.5 16.5H2" />
    <path d="M9 4V2" /><path d="M9 10V8" /><path d="M18.5 2.5L21.5 5.5" /><path d="M18.5 9.5L21.5 6.5" />
    <path d="M6 13v-2" /><path d="M6 22v-2" /><path d="M2.5 16.5H9.5" />
    <path d="M4.5 2.5L1.5 5.5" /><path d="M4.5 9.5L1.5 6.5" />
  </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-3 w-3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-3 w-3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-3 w-3"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-3 w-3"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);


// --- Main Application Component ---

export default function ResumeBuilderPage() {
  // --- State Management ---
  const [resumeData, setResumeData] = useState({
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '123-456-7890',
    linkedin: 'linkedin.com/in/yourprofile',
    github: 'github.com/yourusername',
    summary: 'A brief professional summary about yourself. Highlight your key skills and career goals.',
    loadingAISummary: false,
    experience: [
      {
        id: 1,
        company: 'Tech Solutions Inc.',
        role: 'Software Engineer',
        date: 'Jan 2022 - Present',
        description: 'Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to define and ship new features.',
        loadingAI: false,
      },
    ],
    education: [
      {
        id: 1,
        institution: 'University of Technology',
        degree: 'B.S. in Computer Science',
        date: '2018 - 2022',
      },
    ],
    skills: ['React', 'Node.js', 'JavaScript', 'HTML & CSS', 'Git'],
    projects: [
      {
        id: 1,
        name: 'AI Resume Builder',
        link: 'github.com/yourusername/resume-builder',
        description: 'A web application that helps users create professional resumes with AI-powered suggestions for job descriptions.',
        loadingAI: false,
      }
    ],
    certifications: [
      {
        id: 1,
        name: 'React - The Complete Guide',
        issuer: 'Udemy',
        date: '2023'
      }
    ]
  });

  const [pdfLibrariesReady, setPdfLibrariesReady] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [serverError, setServerError] = useState('');
  const resumePreviewRef = useRef(null);

  // Dynamically load PDF generation libraries to avoid build/import issues.
  useEffect(() => {
    const loadScripts = async () => {
      try {
        if (!(window as any).jspdf && !(window as any).html2canvas) {
          const jspdfScript = document.createElement('script');
          jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          document.body.appendChild(jspdfScript);

          const html2canvasScript = document.createElement('script');
          html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          document.body.appendChild(html2canvasScript);

          await new Promise(resolve => {
            let loadedCount = 0;
            const checkLoaded = () => {
              loadedCount++;
              if (loadedCount === 2) resolve(void 0);
            };
            jspdfScript.onload = checkLoaded;
            html2canvasScript.onload = checkLoaded;
          });
        }
        setPdfLibrariesReady(true);
      } catch (error) {
        console.error("Failed to load PDF libraries:", error);
      }
    };
    loadScripts();
  }, []);

  // --- Event Handlers ---

  const handleChange = (e, section, index = null) => {
    const { name, value } = e.target;
    if (section) {
      const sectionData = [...resumeData[section]];
      sectionData[index][name] = value;
      setResumeData({ ...resumeData, [section]: sectionData });
    } else {
      setResumeData({ ...resumeData, [name]: value });
    }
  };

  const handleSkillsChange = (e) => {
    setResumeData({ ...resumeData, skills: e.target.value.split(',').map(skill => skill.trim()) });
  };

  const handleAdd = (section) => {
    const newId = Date.now();
    let newItem;
    if (section === 'experience') {
      newItem = { id: newId, company: '', role: '', date: '', description: '', loadingAI: false };
    } else if (section === 'education') {
      newItem = { id: newId, institution: '', degree: '', date: '' };
    } else if (section === 'projects') {
      newItem = { id: newId, name: '', link: '', description: '', loadingAI: false };
    } else { // certifications
      newItem = { id: newId, name: '', issuer: '', date: '' };
    }
    setResumeData({ ...resumeData, [section]: [...resumeData[section], newItem] });
  };

  const handleRemove = (section, index) => {
    const sectionData = [...resumeData[section]];
    sectionData.splice(index, 1);
    setResumeData({ ...resumeData, [section]: sectionData });
  };


  // --- AI Enhancement Function ---
  const handleEnhanceWithAI = async (index, textToEnhance, section = 'experience') => {
    // Determine if it's for summary, experience, or projects
    const isSummary = index === null && section === 'experience'; // Default section is experience
    const isProject = section === 'projects';

    // 1. Set loading state for the specific item/summary/project
    if (isSummary) {
      setResumeData({ ...resumeData, loadingAISummary: true });
    } else if (isProject) {
      const projects = [...resumeData.projects];
      projects[index].loadingAI = true;
      setResumeData({ ...resumeData, projects });
    } else {
      const experience = [...resumeData.experience];
      experience[index].loadingAI = true;
      setResumeData({ ...resumeData, experience });
    }
    setServerError(''); // Clear previous errors

    try {
      // 2. Make the API call to the backend server
      const response = await fetch('http://localhost:3001/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: textToEnhance }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok. Is the server running?');
      }

      const data = await response.json();

      // 3. Update the description/summary/project with the AI-generated text
      if (isSummary) {
        setResumeData({ ...resumeData, summary: data.enhancedText.trim() });
      } else if (isProject) {
        const projects = [...resumeData.projects];
        projects[index].description = data.enhancedText.trim();
        setResumeData({ ...resumeData, projects });
      } else {
        const experience = [...resumeData.experience]; // Re-read state in case of changes
        experience[index].description = data.enhancedText.trim();
        setResumeData({ ...resumeData, experience });
      }

    } catch (error) {
      console.error('AI Enhancement Error:', error);
      setServerError('AI enhancement failed. Please ensure your backend server is running and try again.');
    } finally {
      // 4. Reset the loading state
      if (isSummary) {
        setResumeData((prevData) => ({ ...prevData, loadingAISummary: false }));
      } else if (isProject) {
        const projects = [...resumeData.projects];
        projects[index].loadingAI = false;
        setResumeData({ ...resumeData, projects });
      } else {
        const experience = [...resumeData.experience]; // Re-read state
        experience[index].loadingAI = false;
        setResumeData({ ...resumeData, experience });
      }
    }
  };


  // --- PDF Download Function ---
  const handleDownloadPDF = async () => {
    if (!pdfLibrariesReady || !resumePreviewRef.current) {
        alert("PDF libraries are still loading. Please wait a moment and try again.");
        return;
    }
    setLoadingPDF(true);
    try {
        const { jsPDF } = (window as any).jspdf;
        const canvas = await (window as any).html2canvas(resumePreviewRef.current, {
            scale: 2, // Improve resolution
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');

        // A4 dimensions in points: 595.28 x 841.89
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const widthInPdf = pdfWidth - 40; // with some margin
        const heightInPdf = widthInPdf / ratio;
        
        let heightLeft = heightInPdf;
        let position = 20;

        pdf.addImage(imgData, 'PNG', 20, position, widthInPdf, heightInPdf);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - heightInPdf;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 20, position, widthInPdf, heightInPdf);
            heightLeft -= pdfHeight;
        }

        pdf.save('resume.pdf');
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was an error generating the PDF.");
    }
    setLoadingPDF(false);
  };


  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-700">AI Assisted Resume Builder</h1>
          <p className="text-lg text-gray-500 mt-2">Create a professional resume in minutes.</p>
        </header>

        {/* Server Error Message */}
        {serverError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
            <p className="font-bold">Connection Error</p>
            <p>{serverError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Your Information</h2>
            
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                name="name" 
                value={resumeData.name} 
                onChange={(e) => handleChange(e, null)} 
                placeholder="Full Name" 
                className="p-2 border rounded" 
              />
              <input type="email" name="email" value={resumeData.email} onChange={(e) => handleChange(e, null)} placeholder="Email" className="p-2 border rounded" />
              <input type="tel" name="phone" value={resumeData.phone} onChange={(e) => handleChange(e, null)} placeholder="Phone" className="p-2 border rounded" />
              <input type="text" name="linkedin" value={resumeData.linkedin} onChange={(e) => handleChange(e, null)} placeholder="LinkedIn Profile URL" className="p-2 border rounded" />
              <input type="text" name="github" value={resumeData.github} onChange={(e) => handleChange(e, null)} placeholder="GitHub Profile URL" className="p-2 border rounded md:col-span-2" />
            </div>

            {/* Summary */}
            <textarea 
              name="summary" 
              value={resumeData.summary} 
              onChange={(e) => handleChange(e, null)} 
              placeholder="Professional Summary" 
              className="w-full p-2 border rounded mb-2 h-28"
            ></textarea>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => handleEnhanceWithAI(null, resumeData.summary)} 
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-indigo-300"
                disabled={resumeData.loadingAISummary} // Assuming you'll add a loadingAISummary state
              >
                {resumeData.loadingAISummary ? <Spinner/> : <MagicWandIcon />}
                {resumeData.loadingAISummary ? 'Enhancing...' : 'Enhance with AI'}
              </button>
            </div>

            {/* Experience */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Experience</h3>
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="mb-4 p-4 border rounded bg-gray-50">
                <input type="text" name="company" value={exp.company} onChange={(e) => handleChange(e, 'experience', index)} placeholder="Company" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="role" value={exp.role} onChange={(e) => handleChange(e, 'experience', index)} placeholder="Role / Title" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="date" value={exp.date} onChange={(e) => handleChange(e, 'experience', index)} placeholder="Date (e.g., Jan 2022 - Present)" className="w-full p-2 border rounded mb-2" />
                <textarea name="description" value={exp.description} onChange={(e) => handleChange(e, 'experience', index)} placeholder="Job Description" className="w-full p-2 border rounded h-32"></textarea>
                <div className="flex justify-between items-center mt-2">
                  <button onClick={() => handleEnhanceWithAI(index, exp.description)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-indigo-300" disabled={exp.loadingAI}>
                    {exp.loadingAI ? <Spinner/> : <MagicWandIcon />}
                    {exp.loadingAI ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                  <button onClick={() => handleRemove('experience', index)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => handleAdd('experience')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6 transition-colors duration-300">Add Experience</button>

            {/* Education */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Education</h3>
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="mb-4 p-4 border rounded bg-gray-50">
                <input type="text" name="institution" value={edu.institution} onChange={(e) => handleChange(e, 'education', index)} placeholder="Institution" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="degree" value={edu.degree} onChange={(e) => handleChange(e, 'education', index)} placeholder="Degree / Certificate" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="date" value={edu.date} onChange={(e) => handleChange(e, 'education', index)} placeholder="Date (e.g., 2018 - 2022)" className="w-full p-2 border rounded mb-2" />
                <div className="text-right">
                    <button onClick={() => handleRemove('education', index)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => handleAdd('education')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6 transition-colors duration-300">Add Education</button>

            {/* Skills */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Skills</h3>
            <textarea value={resumeData.skills.join(', ')} onChange={handleSkillsChange} placeholder="Enter skills, separated by commas" className="w-full p-2 border rounded mb-6"></textarea>

            {/* Projects */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Projects</h3>
            {resumeData.projects.map((proj, index) => (
              <div key={proj.id} className="mb-4 p-4 border rounded bg-gray-50">
                <input type="text" name="name" value={proj.name} onChange={(e) => handleChange(e, 'projects', index)} placeholder="Project Name" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="link" value={proj.link} onChange={(e) => handleChange(e, 'projects', index)} placeholder="Project Link (e.g., GitHub, Live Demo)" className="w-full p-2 border rounded mb-2" />
                <textarea name="description" value={proj.description} onChange={(e) => handleChange(e, 'projects', index)} placeholder="Project Description" className="w-full p-2 border rounded mb-2 h-24"></textarea>
                <div className="flex justify-end mb-2">
                  <button 
                    onClick={() => handleEnhanceWithAI(index, proj.description, 'projects')} 
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-indigo-300"
                    disabled={proj.loadingAI}
                  >
                    {proj.loadingAI ? <Spinner/> : <MagicWandIcon />}
                    {proj.loadingAI ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <div className="text-right mt-2">
                    <button onClick={() => handleRemove('projects', index)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => handleAdd('projects')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6 transition-colors duration-300">Add Project</button>

            {/* Certifications */}
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Certifications</h3>
            {resumeData.certifications.map((cert, index) => (
              <div key={cert.id} className="mb-4 p-4 border rounded bg-gray-50">
                <input type="text" name="name" value={cert.name} onChange={(e) => handleChange(e, 'certifications', index)} placeholder="Certification Name" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="issuer" value={cert.issuer} onChange={(e) => handleChange(e, 'certifications', index)} placeholder="Issuing Organization" className="w-full p-2 border rounded mb-2" />
                <input type="text" name="date" value={cert.date} onChange={(e) => handleChange(e, 'certifications', index)} placeholder="Date (e.g., 2023)" className="w-full p-2 border rounded mb-2" />
                <div className="text-right">
                    <button onClick={() => handleRemove('certifications', index)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={() => handleAdd('certifications')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-6 transition-colors duration-300">Add Certification</button>

          </div>

          {/* Preview Section */}
          <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Live Preview</h2>
              <button onClick={handleDownloadPDF} disabled={!pdfLibrariesReady || loadingPDF} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-green-300">
                {loadingPDF ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
            
            {/* The actual resume content to be captured */}
            <div ref={resumePreviewRef} className="bg-white p-8 border rounded-md min-h-[800px] text-sm">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold">{resumeData.name}</h1>
                    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-xs mt-2 text-gray-600">
                        {resumeData.email && (
                            <span className="flex items-center">
                                <EmailIcon />
                                {resumeData.email}
                            </span>
                        )}
                        {resumeData.phone && (
                            <span className="flex items-center">
                                <PhoneIcon />
                                {resumeData.phone}
                            </span>
                        )}
                        {resumeData.linkedin && (
                            <span className="flex items-center">
                                <LinkedinIcon />
                                {resumeData.linkedin}
                            </span>
                        )}
                        {resumeData.github && (
                            <span className="flex items-center">
                                <GithubIcon />
                                {resumeData.github}
                            </span>
                        )}
                    </div>
                </header>

                <section>
                    <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
                    <p className="text-gray-700">{resumeData.summary}</p>
                </section>

                <section className="mt-4">
                    <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">WORK EXPERIENCE</h2>
                    {resumeData.experience.map(exp => (
                        <div key={exp.id} className="mb-3">
                            <div className="flex justify-between font-bold">
                                <h3>{exp.company}</h3>
                                <span>{exp.date}</span>
                            </div>
                            <div className="italic mb-1">{exp.role}</div>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                {exp.description.split('\n').map((line, i) => line && <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
                
                <section className="mt-4">
                    <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">EDUCATION</h2>
                    {resumeData.education.map(edu => (
                        <div key={edu.id} className="mb-2">
                             <div className="flex justify-between font-bold">
                                <h3>{edu.institution}</h3>
                                <span>{edu.date}</span>
                            </div>
                            <div className="italic">{edu.degree}</div>
                        </div>
                    ))}
                </section>

                <section className="mt-4">
                    <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">PROJECTS</h2>
                    {resumeData.projects.map(proj => (
                        <div key={proj.id} className="mb-3">
                            <div className="flex justify-between font-bold">
                                <h3>{proj.name}</h3>
                                <span className="font-normal italic text-gray-600">{proj.link}</span>
                            </div>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                {proj.description.split('\n').map((line, i) => line && <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>

                <section className="mt-4">
                    <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">CERTIFICATIONS</h2>
                    {resumeData.certifications.map(cert => (
                        <div key={cert.id} className="mb-2">
                             <div className="flex justify-between font-bold">
                                <h3>{cert.name}</h3>
                                <span>{cert.date}</span>
                            </div>
                            <div className="italic">{cert.issuer}</div>
                        </div>
                    ))}
                </section>

                <section className="mt-4">
                    <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">SKILLS</h2>
                    <p className="text-gray-700">{resumeData.skills.join(' • ')}</p>
                </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}