import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi';

// VideoSlide Component
const VideoSlide = ({ video, isActive, isMuted }) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented
      });
    }
  }, [isActive]);

  if (videoError) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-2">Video Preview</p>
          <p className="text-sm opacity-75">{video.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      <video
        ref={videoRef}
        src={video.video}
        poster={video.poster}
        className="w-full h-full object-cover"
        muted={isMuted}
        loop
        playsInline
        onLoadedData={() => setIsLoading(false)}
        onError={() => setVideoError(true)}
      />
      
      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-end">
        <div className="p-8 md:p-12 text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm uppercase tracking-wider mb-2 opacity-80"
          >
            {video.subtitle}
          </motion.p>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-display font-bold mb-3"
          >
            {video.title}
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            <span className="text-lg">{video.productName}</span>
            <span className="text-2xl font-bold">₹{video.price}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Main VideoCarousel Component
const VideoCarousel = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Sample video data with posters
  const videoData = [
    {
      id: 1,
      video: '/videos/luxury-bow-1.mp4',
      poster: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      title: 'Silk Collection',
      subtitle: 'Elegance Redefined',
      productName: 'Silk Satin Bow',
      price: 1299,
      link: '/product/1'
    },
    {
      id: 2,
      video: '/videos/luxury-bow-2.mp4',
      poster: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      title: 'Velvet Dreams',
      subtitle: 'Luxurious Comfort',
      productName: 'Velvet Ribbon Bow',
      price: 1599,
      link: '/product/2'
    },
    {
      id: 3,
      video: '/videos/luxury-bow-3.mp4',
      poster: 'https://images.unsplash.com/photo-1623859062539-d3636cac0845?w=800',
      title: 'Pearl Elegance',
      subtitle: 'Timeless Beauty',
      productName: 'Pearl Embellished Bow',
      price: 2499,
      link: '/product/3'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative group rounded-2xl overflow-hidden shadow-2xl"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <Swiper
        modules={[Navigation, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={1000}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={(swiper) => {
          if (swiper.params.navigation) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }
        }}
        className="aspect-[21/9] max-h-[600px]"
      >
        {videoData.map((video, index) => (
          <SwiperSlide key={video.id}>
            <VideoSlide 
              video={video} 
              isActive={index === activeIndex}
              isMuted={isMuted}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation with Animation */}
      <AnimatePresence>
        {showControls && (
          <>
            <motion.button
              ref={prevRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white transition-all duration-300"
              aria-label="Previous video"
            >
              <FiChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              ref={nextRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white transition-all duration-300"
              aria-label="Next video"
            >
              <FiChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Sound Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-6 right-6 z-20 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/70 transition-all duration-300"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <FiVolumeX className="w-5 h-5" />
        ) : (
          <FiVolume2 className="w-5 h-5" />
        )}
      </motion.button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {videoData.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            onClick={() => swiperRef.current?.slideTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'w-8 bg-white' 
                : 'w-4 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Autoplay Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
        <motion.div
          key={activeIndex}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>
    </motion.div>
  );
};

export default VideoCarousel;