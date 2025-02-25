import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    MessageCircle,
    ThumbsUp,
    MessageSquare,
    Search,
    Filter,
} from "lucide-react";

const initialTopics = [
    {
        id: "1",
        title: "New Treatment Methods Discussion",
        author: "Dr. Sarah Johnson",
        content: "I'd like to discuss the latest treatment methods for cardiac patients. Recent studies have shown promising results with minimally invasive procedures. What are your thoughts on implementing these in our hospital?",
        likes: 15,
        replies: 23,
        date: "2024-02-20",
        category: "Cardiology",
    },
    {
        id: "2",
        title: "Emergency Protocol Updates",
        author: "Dr. Michael Chen",
        content: "We need to review our emergency protocols for the night shift. I've noticed some inconsistencies in our response times. Let's discuss potential improvements and standardization across all departments.",
        likes: 8,
        replies: 12,
        date: "2024-02-19",
        category: "Emergency",
    },
    {
        id: "3",
        title: "Medical Equipment Training Session",
        author: "Dr. Emily Rodriguez",
        content: "We're organizing a training session for the new MRI machine next week. All interested staff members please indicate your preferred time slots. This is mandatory for radiology department staff.",
        likes: 20,
        replies: 18,
        date: "2024-02-18",
        category: "Training",
    },
];

const Forum = () => {
    const [topics, setTopics] = useState(initialTopics);
    const [searchQuery, setSearchQuery] = useState("");
    const [newTopic, setNewTopic] = useState({
        title: "",
        content: "",
        category: "",
    });

    const handleSearch = (query) => {
        setSearchQuery(query);
        // If search query is empty, show all topics
        if (!query.trim()) {
            setTopics(initialTopics);
            return;
        }
        // Filter topics based on search query
        const filtered = initialTopics.filter(
            (topic) =>
                topic.title.toLowerCase().includes(query.toLowerCase()) ||
                topic.content.toLowerCase().includes(query.toLowerCase()) ||
                topic.category.toLowerCase().includes(query.toLowerCase())
        );
        setTopics(filtered);
    };

    const handleLike = (topicId) => {
        setTopics(
            topics.map((topic) =>
                topic.id === topicId
                    ? { ...topic, likes: topic.likes + 1 }
                    : topic
            )
        );
    };

    const handleAddTopic = () => {
        const newTopicData = {
            id: (topics.length + 1).toString(),
            title: newTopic.title,
            author: "Dr. John Doe", // In a real app, this would come from auth
            content: newTopic.content,
            likes: 0,
            replies: 0,
            date: new Date().toISOString().split("T")[0],
            category: newTopic.category,
        };

        setTopics([newTopicData, ...topics]);
        setNewTopic({ title: "", content: "", category: "" });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Medical Forum</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            New Topic
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create New Topic</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                            <Input
                                placeholder="Topic Title"
                                value={newTopic.title}
                                onChange={(e) =>
                                    setNewTopic({ ...newTopic, title: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Category"
                                value={newTopic.category}
                                onChange={(e) =>
                                    setNewTopic({ ...newTopic, category: e.target.value })
                                }
                            />
                            <textarea
                                placeholder="Write your topic content here..."
                                className="w-full min-h-[200px] p-4 border rounded-md"
                                value={newTopic.content}
                                onChange={(e) =>
                                    setNewTopic({ ...newTopic, content: e.target.value })
                                }
                            />
                            <Button onClick={handleAddTopic} className="w-full">
                                Post Topic
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search topics..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {topics.map((topic) => (
                            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{topic.title}</CardTitle>
                                        <span className="text-sm text-muted-foreground">
                                            {topic.date}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Posted by {topic.author}
                                        </span>
                                        <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                                            {topic.category}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4">{topic.content}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleLike(topic.id)}
                                        >
                                            <ThumbsUp className="w-4 h-4 mr-2" />
                                            {topic.likes} Likes
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            {topic.replies} Replies
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forum;