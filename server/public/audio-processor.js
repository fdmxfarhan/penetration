class PCMProcessor extends AudioWorkletProcessor {

    constructor() {

        super();

        this.queue = [];
        this.current = null;
        this.position = 0;

        this.port.onmessage = (event) => {

            this.queue.push(event.data);

        };

    }


    process(inputs, outputs) {

        const output =
            outputs[0][0];

        for (
            let i = 0;
            i < output.length;
            i++
        ) {

            if (
                !this.current ||
                this.position >=
                this.current.length
            ) {

                this.current =
                    this.queue.shift();

                this.position = 0;

            }


            if (this.current) {

                output[i] =
                    this.current[
                        this.position++
                    ];

            } else {

                output[i] = 0;

            }

        }

        return true;

    }

}

registerProcessor(
    "pcm-processor",
    PCMProcessor
);