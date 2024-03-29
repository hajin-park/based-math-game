import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { QuizContext, ResultContext } from "@/Contexts.js";

export default function Quiz() {
    const navigate = useNavigate();
    // @ts-ignore
    const { settings } = useContext(QuizContext);
    // @ts-ignore
    const { results } = useContext(ResultContext);

    return (
        <Card className="mx-auto w-5/6 md:w-2/3 lg:w-3/5 bg-gray-50">
            <CardHeader>
                <h1 className="text-center">Score: {results.score}</h1>
                <h1 className="text-center">Duration: {settings.duration}</h1>
            </CardHeader>
            <CardContent>
                <div className="w-fit mx-auto">
                    <Button
                        onClick={() => {
                            navigate("/");
                        }}
                    >
                        Play again?
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-sm font-thing">
                    Open issues or pull requests to report any bugs, issues, or
                    suggestions.
                </p>
            </CardFooter>
        </Card>
    );
}
