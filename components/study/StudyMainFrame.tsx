import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useAtom } from 'jotai';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useState } from 'react';
import { StudyApi } from '../../api/StudyApi';
import { AtomActiveQuestion, AtomAge, AtomEnglish, AtomJapanse, AtomTranslation } from '../../models/jotai/StudyJotai';
import endStudy from '../../models/process/endStudy';
import useStudy from '../../models/util-hooks/useStudy';
import { Copyright } from '../footer/Copyright';
import PhraseList from '../phrase/PhraseList';
import PublicAnswers from '../publicAnswers/PublicAnswers';
import Review from './Review';
import WriteEnglish from './WriteEnglish';
import WriteJapanese from './WriteJapanese';


const steps = ['Japanese', 'English', 'Review'];
const stepTitles = ["日本語で意見を書く", "英語にする", "お手本と比べる"]

function getStepContent(step: number) {
    switch (step) {
        case 0:
            return <WriteJapanese />;
        case 1:
            return <WriteEnglish />;
        case 2:
            return <Review />;
        default:
            throw new Error('Unknown step');
    }
}

interface Props {
    categorySlug?: string
}

export default function StudyMainFrame(props: Props) {

    const [activeStep, setActiveStep] = useState(0);
    const [errorMessage, setErrorMessage] = useState("")

    const [japanese, setJapanese] = useAtom(AtomJapanse)
    const [english, setEnglish] = useAtom(AtomEnglish)
    const [translation, setTranslation] = useAtom(AtomTranslation)
    const [___, setAtomAge] = useAtom(AtomAge)
    const { savePrevStudiedCategory } = useStudy()
    const [activeQuestion, setActiveQuestion] = useAtom(AtomActiveQuestion)

    useEffect(() => {
        if (props.categorySlug) {
            savePrevStudiedCategory(props.categorySlug)
        }
    }, [props.categorySlug])

    useEffect(() => {
        const getTopic = async () => {
            try {
                const res = await StudyApi.getTopic()
                setActiveQuestion({ topicId: res.topicId, title: res.topicTitle, description: res.topicDescription })
            } catch (e) {
                console.warn(e)
                router.push(`/q/${props.categorySlug || "free"}/start`)
            }
        }
        getTopic()
    }, [])

    //router
    const router = useRouter()

    const skipStudy = async () => {
        setJapanese("")
        setEnglish("")
        setTranslation("")
        setAtomAge(0)

        await endStudy(activeQuestion.topicId)

        router.push(`/record/${props.categorySlug}`)
        return
    }

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            //最後のステップ

            //初期化
            setJapanese("")
            setEnglish("")
            setTranslation("")
            setAtomAge(0)
            router.push(`/record/${props.categorySlug}`)
            return
        }

        // API飛ばしてエラー返ってきたらエラーハンドリングする
        if (activeStep === 0) {
            const res = await StudyApi.sendJapanese(japanese)
            if (!res.success) {
                setErrorMessage(res.message)
                return
            }
        } else if (activeStep === 1) {
            const res = await StudyApi.sendEnglish(english)
            if (!res.success) {
                setErrorMessage(res.message)
                return
            }
            const resTranslation = await StudyApi.translate(japanese, activeQuestion.title)
            setTranslation(resTranslation.translation)

            //ここに持っていく
            await endStudy(activeQuestion.topicId)
        }

        setErrorMessage("")
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setEnglish("")
        setActiveStep(activeStep - 1);
    };

    const NextButton = (text: string, disable: boolean) => (
        <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={disable}
            style={{
                marginTop: "30px",
                marginLeft: "10px",
            }}
        >
            {text}
        </Button>
    )

    const renderPublicAnswers = () => {
        if (activeStep === 2) {
            return <div style={{ marginTop: 30 }}>
                <PublicAnswers />
            </div>
        }
    }

    const renderButtons = () => {
        if (activeStep === 0) {
            return (
                NextButton("次へ進む", japanese.length === 0)
            )
        } else if (activeStep === 1) {
            return (
                <>
                    <Button onClick={handleBack} style={{
                        marginTop: "30px",
                        marginLeft: "10px",
                    }}>
                        日本語入力に戻る
                    </Button>
                    {NextButton("次へ進む", english.length === 0)}
                </>
            )
        } else if (activeStep === 2) {
            return (
                <>
                    <Button onClick={handleBack} style={{
                        marginTop: "30px",
                        marginLeft: "10px",
                    }}>
                        英語入力に戻る
                    </Button>
                    {NextButton("終了", false)}
                </>
            )
        }
    }

    return (
        <React.Fragment>
            <main style={{
                width: 'auto',
                maxWidth: "600px",
                marginRight: "auto",
                marginLeft: "auto"
            }}>
                <Paper style={{
                    marginTop: "30px",
                    padding: "20px",
                    maxWidth: "600px",
                    marginRight: "auto",
                    marginLeft: "auto"
                }}>
                    {/* タイトル(ご希望あれば) */}
                    <Typography component="h1" variant="h4" align="center" style={{ marginBottom: 10 }}>
                        {stepTitles[activeStep]}
                    </Typography>

                    {/* ステッパー */}
                    <Stepper activeStep={activeStep} style={{ margin: "0px 0px 30px" }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <React.Fragment>
                        {getStepContent(activeStep)}
                        <div style={{ color: "#f44336" }}>
                            {errorMessage}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}>
                            {renderButtons()}
                        </div>

                        {renderPublicAnswers()}
                    </React.Fragment>
                </Paper>
                <div style={{ textAlign: "right", marginRight: 10, marginTop: 10, marginBottom: 10 }}>
                    <Typography
                        onClick={skipStudy}
                        variant="overline"
                        style={{ cursor: "pointer", fontSize: 18, lineHeight: 1 }}>
                        skip→
                    </Typography>
                    <br />
                    <Typography variant="caption">
                        (※Skipした場合もハートを消費します)
                    </Typography>
                </div>
                <div style={{ height: 10 }} />
                <Copyright />
            </main>
        </React.Fragment >
    );
}