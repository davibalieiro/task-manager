import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-layout">
      <main className="dashboard-main dashboard-main-expanded">
        <div className="not-found-page">
          <motion.div
            className="not-found-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <FileQuestion className="h-20 w-20" />
          </motion.div>
          <motion.h1
            className="not-found-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            404
          </motion.h1>
          <motion.h2
            className="not-found-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Página não encontrada
          </motion.h2>
          <motion.p
            className="not-found-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            A página que você procura não existe ou foi movida.
          </motion.p>
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </motion.button>
        </div>
      </main>
    </div>
  )
}
