import { exec } from 'child_process';
import { Router, text } from 'express';
import { unlinkSync, writeFileSync } from 'fs';
import { tmpNameSync } from 'tmp';
import config from './config';

const router = Router();

type Target = 'michelson' | 'michelson-storage' | 'markdown' | 'ligo' | 'smartpy' | 'whyml';

async function compileArchetype(target: Target, code: string): Promise<string | Error> {
    const tmpFilePath = tmpNameSync({ postfix: '.arl' });
    try {
        writeFileSync(tmpFilePath, code.toString());
        const result = await new Promise<string | Error>((resolve, reject) => {
            const command = `${config.ARCHETYPE_PATH} -t ${target} ${tmpFilePath}`;
            exec(command, (error, stdout, stderr) => {
                console.log(error, stdout, stderr);
                if (error || stderr) reject(stderr || (error ? error.message : 'Failed to compile code.'));
                else resolve(stdout);
            });
        });
        return result;
    } catch(e) {
        return e instanceof Error ? e : new Error(typeof e === 'string' ? e : 'Failed to compile code.');
    } finally {
        try {
            unlinkSync(tmpFilePath);
        } catch(e) { console.log(e) }
    }
}

router.get('/compile', (req, res) => {
    res.status(200).send({ ARCHETYPE_PATH: `${config.ARCHETYPE_PATH}`, PROCESS: process.env});
});

router.post('/compile', async (req, res) => {
    try {
        if (!req.body.code) throw new Error('Code not provided.');
        const targets: Target[] = req.query['t']
            ? (req.query['t'] as string).split(',') as Target[] 
            : ['michelson', 'michelson-storage', 'markdown', 'ligo', 'smartpy', 'whyml'];

        const [
            michelson,
            michelsonStorage,
            markdown,
            ligo,
            smartpy,
            whyml
        ] = await Promise.all(targets.map(target => compileArchetype(target, req.body.code)));
        res.status(200).send({
            michelson: michelson instanceof Error ? michelson.message : michelson,
            'michelson-storage': michelsonStorage instanceof Error ? michelsonStorage.message : michelsonStorage,
            markdown: markdown instanceof Error ? markdown.message : markdown,
            ligo: ligo instanceof Error ? ligo.message : ligo,
            smartpy: smartpy instanceof Error ? smartpy.message : smartpy,
            whyml: whyml instanceof Error ? whyml.message : whyml
        });
    } catch(e) {
        let error: string;
        if (e instanceof Error) error = e.message;
        else if (typeof e === 'string') error = e;
        else error = 'An unexpected error occurred.';
        res.status(500).send(error);
    }
});

export default router;
