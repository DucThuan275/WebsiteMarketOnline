"use client"

import { Link } from "react-router-dom"
import { ChevronRight, Users, Target, Clock, Star, MapPin, Phone, Mail, Zap, Shield } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Add a custom hook for intersection observer
const useInView = (options = {}) => {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, options)

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [options])

  return [ref, isInView]
}

// Add animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInBottom {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeInUp {
    opacity: 0;
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-fadeInLeft {
    opacity: 0;
    animation: fadeInLeft 0.6s ease-out forwards;
  }

  .animate-fadeInRight {
    opacity: 0;
    animation: fadeInRight 0.6s ease-out forwards;
  }

  .animate-scaleIn {
    opacity: 0;
    animation: scaleIn 0.6s ease-out forwards;
  }

  .animate-slideInBottom {
    opacity: 0;
    animation: slideInBottom 0.6s ease-out forwards;
  }

  .delay-100 {
    animation-delay: 0.1s;
  }
  .delay-200 {
    animation-delay: 0.2s;
  }
  .delay-300 {
    animation-delay: 0.3s;
  }
  .delay-400 {
    animation-delay: 0.4s;
  }
  .delay-500 {
    animation-delay: 0.5s;
  }
  .delay-600 {
    animation-delay: 0.6s;
  }
  .delay-700 {
    animation-delay: 0.7s;
  }
  .delay-800 {
    animation-delay: 0.8s;
  }
  .delay-900 {
    animation-delay: 0.9s;
  }
  .delay-1000 {
    animation-delay: 1s;
  }
`

const About = () => {
  // Add refs for each section
  const [heroRef, heroInView] = useInView({ threshold: 0.1 })
  const [storyRef, storyInView] = useInView({ threshold: 0.1 })
  const [valuesRef, valuesInView] = useInView({ threshold: 0.1 })
  const [missionRef, missionInView] = useInView({ threshold: 0.1 })
  const [teamRef, teamInView] = useInView({ threshold: 0.1 })
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1 })
  const [faqRef, faqInView] = useInView({ threshold: 0.1 })
  const [contactRef, contactInView] = useInView({ threshold: 0.1 })
  const [newsletterRef, newsletterInView] = useInView({ threshold: 0.1 })

  // Add animation styles to the document
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = animationStyles
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 text-sm">
          <li className="inline-flex items-center">
            <Link to="/trang-chu" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium" aria-current="page">
                Giới thiệu
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${heroInView ? "animate-fadeInUp" : "opacity-0"}`}>
              Về VDUCKTIE
            </h1>
            <p className={`text-xl text-blue-100 mb-8 ${heroInView ? "animate-fadeInUp delay-200" : "opacity-0"}`}>
              Chúng tôi là nhà cung cấp giải pháp công nghệ hàng đầu Việt Nam, mang đến những sản phẩm và dịch vụ công
              nghệ tiên tiến nhất cho người dùng.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section ref={storyRef} className="py-16 md:py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className={`text-3xl font-bold mb-6 text-blue-800 ${storyInView ? "animate-fadeInLeft" : "opacity-0"}`}>
              Hành Trình Của Chúng Tôi
            </h2>
            <p className={`text-gray-600 mb-4 ${storyInView ? "animate-fadeInLeft delay-200" : "opacity-0"}`}>
              Thành lập vào năm 2010, VDUCKTIE bắt đầu từ một cửa hàng nhỏ chuyên bán các thiết bị điện tử và phụ kiện
              công nghệ tại Hà Nội. Với tầm nhìn trở thành đơn vị cung cấp giải pháp công nghệ toàn diện, chúng tôi
              không ngừng mở rộng danh mục sản phẩm và dịch vụ.
            </p>
            <p className={`text-gray-600 mb-4 ${storyInView ? "animate-fadeInLeft delay-300" : "opacity-0"}`}>
              Từ một cửa hàng nhỏ, chúng tôi đã phát triển thành một hệ thống với hơn 30 showroom trên toàn quốc, cùng
              nền tảng thương mại điện tử phục vụ hàng triệu khách hàng mỗi năm. Chúng tôi tự hào là đối tác chính thức
              của các thương hiệu công nghệ hàng đầu thế giới.
            </p>
            <p className={`text-gray-600 ${storyInView ? "animate-fadeInLeft delay-400" : "opacity-0"}`}>
              Với đội ngũ chuyên gia công nghệ giàu kinh nghiệm, chúng tôi không chỉ bán sản phẩm mà còn mang đến những
              giải pháp công nghệ toàn diện, đáp ứng mọi nhu cầu của khách hàng cá nhân và doanh nghiệp.
            </p>
          </div>
          <div className={`relative ${storyInView ? "animate-fadeInRight delay-300" : "opacity-0"}`}>
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?q=80&w=800&auto=format&fit=crop"
                alt="Cửa hàng công nghệ hiện đại"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={`absolute -bottom-6 -left-6 bg-blue-600 p-4 shadow-lg rounded-lg w-32 h-32 flex items-center justify-center ${storyInView ? "animate-scaleIn delay-600" : "opacity-0"}`}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-white">13+</p>
                <p className="text-sm text-blue-100">Năm kinh nghiệm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section ref={valuesRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className={`text-3xl font-bold mb-4 text-blue-800 ${valuesInView ? "animate-fadeInUp" : "opacity-0"}`}>
              Giá Trị Cốt Lõi
            </h2>
            <p className={`text-gray-600 ${valuesInView ? "animate-fadeInUp delay-200" : "opacity-0"}`}>
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className={`bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow ${valuesInView ? "animate-fadeInUp delay-300" : "opacity-0"}`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-800">Đổi Mới</h3>
              <p className="text-gray-600">
                Chúng tôi luôn đi đầu trong việc áp dụng công nghệ mới, không ngừng cải tiến sản phẩm và dịch vụ để mang
                đến trải nghiệm tốt nhất cho khách hàng.
              </p>
            </div>

            <div
              className={`bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow ${valuesInView ? "animate-fadeInUp delay-500" : "opacity-0"}`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-800">Chất Lượng</h3>
              <p className="text-gray-600">
                Chúng tôi cam kết cung cấp sản phẩm chính hãng với chất lượng cao nhất, đi kèm chế độ bảo hành và hậu
                mãi tốt nhất thị trường.
              </p>
            </div>

            <div
              className={`bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow ${valuesInView ? "animate-fadeInUp delay-700" : "opacity-0"}`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-800">Khách Hàng</h3>
              <p className="text-gray-600">
                Khách hàng là trọng tâm trong mọi hoạt động của chúng tôi. Chúng tôi luôn lắng nghe, thấu hiểu và đáp
                ứng mọi nhu cầu của khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section ref={missionRef} className="py-16 md:py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={`order-2 md:order-1 ${missionInView ? "animate-fadeInLeft delay-300" : "opacity-0"}`}>
            <div className="relative">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800&auto=format&fit=crop"
                  alt="Công nghệ tiên tiến"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute -bottom-6 -right-6 bg-blue-900 p-4 shadow-lg rounded-lg w-32 h-32 flex items-center justify-center ${missionInView ? "animate-scaleIn delay-600" : "opacity-0"}`}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">30+</p>
                  <p className="text-sm text-blue-200">Showroom</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2
              className={`text-3xl font-bold mb-6 text-blue-800 ${missionInView ? "animate-fadeInRight" : "opacity-0"}`}
            >
              Sứ Mệnh Của Chúng Tôi
            </h2>
            <p className={`text-gray-600 mb-4 ${missionInView ? "animate-fadeInRight delay-200" : "opacity-0"}`}>
              Sứ mệnh của VDUCKTIE là đưa công nghệ tiên tiến đến gần hơn với người dùng Việt Nam, giúp nâng cao chất
              lượng cuộc sống và hiệu quả công việc thông qua các giải pháp công nghệ thông minh.
            </p>
            <p className={`text-gray-600 mb-4 ${missionInView ? "animate-fadeInRight delay-300" : "opacity-0"}`}>
              Chúng tôi cam kết:
            </p>
            <ul
              className={`space-y-2 text-gray-600 mb-6 ${missionInView ? "animate-fadeInRight delay-400" : "opacity-0"}`}
            >
              <li className="flex items-start">
                <div className="mr-2 mt-1">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span>Cung cấp sản phẩm công nghệ chính hãng, chất lượng cao</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span>Tư vấn và hỗ trợ khách hàng chuyên nghiệp, tận tâm</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <span>Phát triển các giải pháp công nghệ phù hợp với nhu cầu người Việt</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section ref={teamRef} className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className={`text-3xl font-bold mb-4 ${teamInView ? "animate-fadeInUp" : "opacity-0"}`}>
              Đội Ngũ Chuyên Gia
            </h2>
            <p className={`text-blue-200 ${teamInView ? "animate-fadeInUp delay-200" : "opacity-0"}`}>
              Những chuyên gia công nghệ hàng đầu đứng sau thành công của VDUCKTIE
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className={`text-center ${teamInView ? "animate-fadeInUp delay-300" : "opacity-0"}`}>
              <div className="aspect-square bg-blue-800 rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop"
                  alt="Nguyễn Minh Tuấn"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">Nguyễn Minh Tuấn</h3>
              <p className="text-blue-300">CEO & Founder</p>
            </div>

            <div className={`text-center ${teamInView ? "animate-fadeInUp delay-400" : "opacity-0"}`}>
              <div className="aspect-square bg-blue-800 rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop"
                  alt="Trần Thị Mai"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">Trần Thị Mai</h3>
              <p className="text-blue-300">CTO</p>
            </div>

            <div className={`text-center ${teamInView ? "animate-fadeInUp delay-500" : "opacity-0"}`}>
              <div className="aspect-square bg-blue-800 rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop"
                  alt="Lê Văn Hùng"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">Lê Văn Hùng</h3>
              <p className="text-blue-300">Giám đốc Marketing</p>
            </div>

            <div className={`text-center ${teamInView ? "animate-fadeInUp delay-600" : "opacity-0"}`}>
              <div className="aspect-square bg-blue-800 rounded-lg overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop"
                  alt="Phạm Thị Lan"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">Phạm Thị Lan</h3>
              <p className="text-blue-300">Giám đốc Dịch vụ Khách hàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-16 md:py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2
            className={`text-3xl font-bold mb-4 text-blue-800 ${testimonialsInView ? "animate-fadeInUp" : "opacity-0"}`}
          >
            Khách Hàng Nói Gì
          </h2>
          <p className={`text-gray-600 ${testimonialsInView ? "animate-fadeInUp delay-200" : "opacity-0"}`}>
            Những đánh giá chân thực từ khách hàng của chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div
            className={`bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow ${testimonialsInView ? "animate-fadeInUp delay-300" : "opacity-0"}`}
          >
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600 mb-6 italic">
              "Tôi đã mua laptop tại VDUCKTIE và rất hài lòng với chất lượng sản phẩm cũng như dịch vụ tư vấn chuyên
              nghiệp. Nhân viên am hiểu sản phẩm và giúp tôi chọn được chiếc máy phù hợp nhất với nhu cầu."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden mr-4">
                <img
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
                  alt="Nguyễn Văn Minh"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Nguyễn Văn Minh</h4>
                <p className="text-sm text-gray-500">Kỹ sư phần mềm</p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow ${testimonialsInView ? "animate-fadeInUp delay-500" : "opacity-0"}`}
          >
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600 mb-6 italic">
              "Dịch vụ bảo hành và hậu mãi của VDUCKTIE thực sự xuất sắc. Khi máy tính của tôi gặp sự cố, họ đã xử lý
              nhanh chóng và chuyên nghiệp. Tôi sẽ tiếp tục mua sắm tại đây trong tương lai."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden mr-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                  alt="Trần Thị Hương"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Trần Thị Hương</h4>
                <p className="text-sm text-gray-500">Giáo viên</p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow ${testimonialsInView ? "animate-fadeInUp delay-700" : "opacity-0"}`}
          >
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500" />
              <Star className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-gray-600 mb-6 italic">
              "Tôi đã trang bị toàn bộ thiết bị công nghệ cho văn phòng của mình tại VDUCKTIE. Họ cung cấp giải pháp
              toàn diện từ máy tính đến hệ thống mạng và bảo mật. Dịch vụ tư vấn rất chuyên nghiệp."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden mr-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
                  alt="Lê Thanh Tùng"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold">Lê Thanh Tùng</h4>
                <p className="text-sm text-gray-500">Chủ doanh nghiệp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className={`text-3xl font-bold mb-4 text-blue-800 ${faqInView ? "animate-fadeInUp" : "opacity-0"}`}>
              Câu Hỏi Thường Gặp
            </h2>
            <p className={`text-gray-600 ${faqInView ? "animate-fadeInUp delay-200" : "opacity-0"}`}>
              Những thông tin hữu ích dành cho bạn
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <div
              className={`bg-white p-6 rounded-lg shadow-sm ${faqInView ? "animate-fadeInUp delay-300" : "opacity-0"}`}
            >
              <h3 className="text-lg font-bold mb-2 text-blue-800">Chính sách bảo hành như thế nào?</h3>
              <p className="text-gray-600">
                VDUCKTIE cung cấp chế độ bảo hành chính hãng cho tất cả sản phẩm. Thời gian bảo hành tùy thuộc vào từng
                sản phẩm và thương hiệu, thông thường từ 12-36 tháng. Ngoài ra, chúng tôi còn có gói bảo hành mở rộng
                cho những khách hàng có nhu cầu.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-lg shadow-sm ${faqInView ? "animate-fadeInUp delay-400" : "opacity-0"}`}
            >
              <h3 className="text-lg font-bold mb-2 text-blue-800">Thời gian giao hàng là bao lâu?</h3>
              <p className="text-gray-600">
                Đối với khu vực nội thành Hà Nội và TP.HCM, thời gian giao hàng thường trong vòng 24 giờ. Đối với các
                tỉnh thành khác, thời gian giao hàng từ 2-5 ngày tùy thuộc vào khu vực. Chúng tôi cũng cung cấp dịch vụ
                giao hàng nhanh trong 2 giờ cho một số sản phẩm.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-lg shadow-sm ${faqInView ? "animate-fadeInUp delay-500" : "opacity-0"}`}
            >
              <h3 className="text-lg font-bold mb-2 text-blue-800">Có hỗ trợ trả góp không?</h3>
              <p className="text-gray-600">
                Có, VDUCKTIE hỗ trợ mua trả góp với nhiều hình thức linh hoạt. Khách hàng có thể trả góp qua thẻ tín
                dụng với lãi suất 0% hoặc trả góp qua công ty tài chính với thủ tục đơn giản, nhanh chóng. Vui lòng liên
                hệ nhân viên tư vấn để biết thêm chi tiết.
              </p>
            </div>

            <div
              className={`bg-white p-6 rounded-lg shadow-sm ${faqInView ? "animate-fadeInUp delay-600" : "opacity-0"}`}
            >
              <h3 className="text-lg font-bold mb-2 text-blue-800">Có dịch vụ sửa chữa tại nhà không?</h3>
              <p className="text-gray-600">
                Có, VDUCKTIE cung cấp dịch vụ sửa chữa tận nơi cho một số sản phẩm như máy tính, máy in, thiết bị
                mạng... Dịch vụ này áp dụng cho khu vực nội thành các thành phố lớn. Khách hàng có thể đặt lịch qua
                hotline hoặc website của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section ref={contactRef} className="py-16 md:py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2
              className={`text-3xl font-bold mb-6 text-blue-800 ${contactInView ? "animate-fadeInLeft" : "opacity-0"}`}
            >
              Liên Hệ Với Chúng Tôi
            </h2>
            <p className={`text-gray-600 mb-8 ${contactInView ? "animate-fadeInLeft delay-200" : "opacity-0"}`}>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi hoặc
              góp ý nào.
            </p>

            <div className={`space-y-4 ${contactInView ? "animate-fadeInLeft delay-300" : "opacity-0"}`}>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Trụ sở chính</h4>
                  <p className="text-gray-600">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Hotline</h4>
                  <p className="text-gray-600">1800 1234 (Miễn phí)</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Email</h4>
                  <p className="text-gray-600">support@VDUCKTIE.vn</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Giờ làm việc</h4>
                  <p className="text-gray-600">Thứ 2 - Chủ nhật: 8:00 - 21:30</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${contactInView ? "animate-fadeInRight delay-400" : "opacity-0"}`}>
            <form className="bg-white p-8 rounded-lg shadow-sm">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập email của bạn"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập nội dung tin nhắn"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section ref={newsletterRef} className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className={`max-w-xl mx-auto text-center ${newsletterInView ? "animate-fadeInUp" : "opacity-0"}`}>
            <h3 className="text-2xl font-semibold mb-4">Đăng Ký Nhận Thông Tin</h3>
            <p className="text-blue-200 mb-6">
              Nhận thông báo về sản phẩm mới, khuyến mãi và tin tức công nghệ mới nhất
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-2 ${newsletterInView ? "animate-fadeInUp delay-300" : "opacity-0"}`}
            >
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 bg-blue-800 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
              <button className="px-6 py-3 bg-white text-blue-900 rounded-md hover:bg-blue-100 transition-colors font-medium">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

