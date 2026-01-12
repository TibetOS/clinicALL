import { useState } from 'react';
import { Plus, SplitSquareHorizontal } from 'lucide-react';
import { Button, Card, Badge } from '../../../components/ui';
import { ImageSlider } from '../../../components/ImageSlider';

interface GalleryTabProps {
  onImageClick: (image: string) => void;
}

interface GalleryImage {
  id: number;
  src: string;
  type: 'before' | 'after';
  treatment: string;
  date: string;
}

export const GalleryTab = ({ onImageClick }: GalleryTabProps) => {
  const [compareMode, setCompareMode] = useState(false);

  // Mock gallery images - in production, fetch from patient data
  const galleryImages: GalleryImage[] = [
    { id: 1, src: 'https://picsum.photos/600/600?random=201', type: 'before', treatment: 'פיסול שפתיים', date: '15.10.2023' },
    { id: 2, src: 'https://picsum.photos/600/600?random=202', type: 'after', treatment: 'פיסול שפתיים', date: '15.10.2023' },
    { id: 3, src: 'https://picsum.photos/600/600?random=203', type: 'before', treatment: 'עיבוי לחיים', date: '20.09.2023' },
    { id: 4, src: 'https://picsum.photos/600/600?random=204', type: 'after', treatment: 'עיבוי לחיים', date: '20.09.2023' },
    { id: 5, src: 'https://picsum.photos/600/600?random=205', type: 'before', treatment: 'טיפול קמטים', date: '05.08.2023' },
    { id: 6, src: 'https://picsum.photos/600/600?random=206', type: 'after', treatment: 'טיפול קמטים', date: '05.08.2023' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h3 className="font-bold text-lg text-gray-900">גלריית לפני / אחרי</h3>
          <Button
            variant={compareMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
          >
            <SplitSquareHorizontal size={16} className="ml-2" /> מצב השוואה
          </Button>
        </div>
        <Button variant="outline" size="sm">
          הוסף תיקייה
        </Button>
      </div>

      {compareMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
          <Card className="p-4">
            <h4 className="font-bold mb-4 text-center">פיסול אף (2023)</h4>
            <ImageSlider
              beforeImage="https://picsum.photos/600/600?random=1"
              afterImage="https://picsum.photos/600/600?random=2"
            />
          </Card>
          <Card className="p-4">
            <h4 className="font-bold mb-4 text-center">עיבוי שפתיים (2022)</h4>
            <ImageSlider
              beforeImage="https://picsum.photos/600/600?random=3"
              afterImage="https://picsum.photos/600/600?random=4"
            />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Upload Placeholder */}
          <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:border-primary/50 hover:text-primary transition-all">
            <Plus size={32} className="mb-2" />
            <span className="text-sm font-medium">העלה תמונה</span>
          </div>

          {/* Gallery Images */}
          {galleryImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
              onClick={() => onImageClick(img.src)}
            >
              <img
                src={img.src}
                alt={`תמונה קלינית ${img.type === 'after' ? 'אחרי' : 'לפני'} טיפול`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="text-white translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-1 text-[10px]">
                    {img.type === 'after' ? 'אחרי' : 'לפני'}
                  </Badge>
                  <p className="font-bold text-sm">{img.treatment}</p>
                  <p className="text-xs opacity-80">{img.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
