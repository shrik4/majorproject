import React from 'react';
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const categories = ['All', 'Urgent', 'Exam', 'Holiday', 'Event'];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => onSelectCategory(category)}
                    className="rounded-full"
                >
                    {category}
                </Button>
            ))}
        </div>
    );
};

export default CategoryFilter;
