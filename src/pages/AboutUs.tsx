import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-navy-900 min-h-screen py-16 text-white">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-center text-purple-700 mb-12 animate-pulse">About Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* College Overview */}
          <div className="bg-gray-800 border-4 border-navy-600 rounded-xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white mb-6">College Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              Vignan's Lara Institute of Technology & Science, established in 2007, is committed to delivering world-class technical education at Vadlamudi, Guntur District. Approved by the All India Council for Technical Education, New Delhi, and affiliated with Jawaharlal Nehru Technological University Kakinada, it lies 14 km from Guntur and 11 km from Tenali on the Guntur-Tenali highway. Embraced by lush, transgenic, and rural landscapes, the expansive campus features majestic avenues, vast playgrounds, and verdant surroundings, attracting engineering aspirants. It is staffed by a dynamic team of Ph.Ds, M.Tech professionals, and skilled technicians.
            </p>
          </div>

          {/* Unique Features */}
          <div className="bg-gray-800 border-4 border-navy-600 rounded-xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white mb-6">Unique Features</h2>
            <ul className="text-gray-300 space-y-4 list-disc list-inside">
              <li>Incentives and prestigious awards for rankers, toppers, and co-curricular achievers.</li>
              <li>Robust Personality Development Programme for competitive excellence.</li>
              <li>Personalized academic counseling with actionable feedback.</li>
              <li>Structured feedback and Class Review Committees for enhanced learning.</li>
              <li>Targeted remedial support for slower learners.</li>
              <li>Proactive parent updates via alerts and correspondence.</li>
              <li>Dynamic participation in events like Vignan Quest, Hackathons, and Codeagons.</li>
              <li>Industry-aligned certifications (NPTEL, Cambridge PET/BEC).</li>
              <li>Specialized on-campus GATE preparation.</li>
              <li>Intensive training for IT, core, and government roles.</li>
              <li>Innovative teacher-student research partnerships.</li>
              <li>Engaging, learner-centric classrooms boosting cognitive growth.</li>
            </ul>
          </div>

          {/* Alumni Website Info */}
          <div className="bg-gray-800 border-4 border-navy-600 rounded-xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-white mb-6">Alumni Website Info</h2>
            <p className="text-gray-300 leading-relaxed">
              Alumni Connect is a cutting-edge platform uniting Vignan's Lara alumni. It promotes meaningful connections, mentorship, and career advancement with features like:
              - Seamless registration and login for alumni and mentors.
              - Rich profiles showcasing experience and photos.
              - Curated job and event listings by admins and mentors.
              - Organized alumni groups by batch and major.
              - Comprehensive admin dashboard for oversight.
              Featuring a sleek interface, it integrates social media and enables profile updates.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link to="/" className="text-white hover:text-navy-600 text-xl font-semibold underline transition-colors duration-300">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;