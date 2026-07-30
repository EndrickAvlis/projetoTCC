import logoEtec from "../assets/logoEtec.png";

const EmitirSenhaPage = () => {
    const handleClick = () => {

    }
    
  return (
    <main className="min-h-screen bg-white">
      <section className="flex min-h-screen w-full flex-col bg-white">
        <div className="flex flex-1 flex-col items-center px-6 pt-8 pb-10 sm:px-10 sm:pt-10">
          <img
            src={logoEtec}
            alt="Etec Philadelpho Gouvêa Netto e Centro Paula Souza"
            className="h-auto w-56 sm:w-64 md:w-72"
          />

          <div className="flex w-full flex-1 items-center justify-center pt-10 sm:pt-12">
            <button
              type="button"
              className="
                min-h-44
                w-full
                max-w-163
                rounded-2xl
                bg-primary
                px-8
                py-6
                text-3xl
                font-bold
                uppercase
                tracking-wide
                text-white
                shadow-lg
                transition
                hover:bg-primary-light
                active:bg-primary-strong
                sm:min-h-50
                sm:text-5xl
              "
              onClick={HandleClick()}
            >
              Emitir senha
            </button>
          </div>
        </div>

        <footer className="flex w-full flex-col items-center bg-[#f5f5f6] px-6 py-8 text-center sm:py-10">
          <section
            aria-label="Senha emitida"
            className="
              flex
              min-h-40
              w-full
              max-w-96
              flex-col
              items-center
              justify-start
              rounded-xl
              border-7
              border-primary
              bg-white
              px-6
              pt-4
              pb-6
              sm:min-h-48
              sm:max-w-110
            "
          >
            <p className="text-2xl font-extrabold uppercase tracking-wide text-primary sm:text-3xl">
              Senha atual
            </p>

            <p className="mt-2 text-6xl font-extrabold leading-none text-gray-700 sm:text-8xl"></p>
          </section>

          <p className="mt-5 text-lg font-bold text-[#1a1a1a] sm:text-2xl">
            Pegue sua senha na impressora.
          </p>
        </footer>
      </section>
    </main>
  );
};

export default EmitirSenhaPage;
