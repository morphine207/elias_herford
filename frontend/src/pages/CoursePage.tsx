import { useParams } from "react-router-dom";
import CoursePlayer from "@/components/CoursePlayer";

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id ? parseInt(id, 10) : 1;

  return <CoursePlayer courseId={courseId} />;
};

export default CoursePage;
