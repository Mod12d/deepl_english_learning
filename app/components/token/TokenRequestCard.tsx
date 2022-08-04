import { Button, Card, CardActions, CardContent, Typography } from "@mui/material"
import { useState } from "react"

interface Props {
    userId: string
    token: number
    tokenRate: number
    price: number
    createdAt: number
    status: string
    amazonGiftCode: string
}

export default (props: Props) => {
    const [displayGiftCode, setDisplayGiftCode] = useState(false)

    const createdAtString = new Date(props.createdAt).toLocaleString()
    const statusText = props.status === "Waiting" ? "発行待ち" : "発行済み"
    return <Card variant="outlined">
        <CardContent>
            <Typography variant="h5" component="div">
                {props.token} トークン交換
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {createdAtString}
            </Typography>
            <Typography variant="body2">
                {statusText}
            </Typography>

            {props.status !== "Waiting" &&
                <Typography variant="body2">
                    {props.token} × {props.tokenRate}円 - 手数料 = {props.price}円
                </Typography>}

        </CardContent>
        <CardActions>
            {!displayGiftCode && <Button onClick={() => setDisplayGiftCode(true)} size="small" disabled={!props.amazonGiftCode}>ギフトコードを表示する</Button>}
            {displayGiftCode && <Typography variant="body1">{props.amazonGiftCode}</Typography>}
        </CardActions>
    </Card>
}