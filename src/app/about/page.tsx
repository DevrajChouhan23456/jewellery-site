import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import TeacherGallery from "@/components/teachers";
import AboutGallery from "@/components/AboutGallery"; // ✅ import

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <header className="py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          About Us
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Learn more about our dedicated teachers, achievements, and the vibrant
          activities that make our school a center of excellence.
        </p>
      </header>

      {/* Teachers Section */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <TeacherGallery />
      </section>

      {/* Activities & Achievements */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-2xl shadow-md p-8 md:col-span-2 hover:shadow-xl transition">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Activities & Achievements
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our school takes pride in a wide range of extracurricular activities
            and student accomplishments in academics, arts, and sports. From
            inter-school competitions to national-level wins, our students
            consistently bring us pride and recognition.
          </p>
        </div>

        {/* ✅ Dynamic Image Gallery */}
        <AboutGallery />
      </section>

      <Footer />
    </div>
  );
};

export default About;
